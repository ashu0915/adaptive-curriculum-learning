from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import subprocess
import uuid
import shutil
import os
import json
from numpy import floor
from tensorboard.backend.event_processing import event_accumulator

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = "datasets"

DATA_DIR2 = "../datasets"
RUN_DIR = "runs"

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(RUN_DIR, exist_ok=True)
os.makedirs(DATA_DIR2, exist_ok=True)


@app.post("/train")
async def train(dataset: UploadFile = File(...), model_name: str = Form(...)):

    model_name = 'distilbert-base-uncased'

    job_id = str(uuid.uuid4())
    dataset_path = f"{DATA_DIR}/{job_id}.jsonl"
    dataset_path2 = f"{DATA_DIR2}/{job_id}.jsonl"

    with open(dataset_path2, "wb") as buffer:
        shutil.copyfileobj(dataset.file, buffer)

    run_dir = f"{RUN_DIR}/{job_id}"

    cmd = [
        "python",
        "run_local.py",
        "--data", dataset_path,
        "--steps", "200",
        "--batch", "4",
        "--use_teacher",
        "--lambda_kld", "0.2",
        "--pacing", "exp_gamma",
        "--logdir", run_dir,
        "--student_model", model_name
    ]

    subprocess.Popen(cmd, cwd="..")

    return {"job_id": job_id}


@app.get("/status/{job_id}")
def status(job_id: str):

    path = f"../runs/{job_id}/final_results.json"

    if os.path.exists(path):
        return {"status": "done"}

    return {"status": "training"}


@app.get("/download/{job_id}")
def download(job_id: str):

    path = f"../runs/{job_id}/model.pt"

    return FileResponse(path, filename="trained_model.pt")

@app.get("/results/{job_id}")
def results(job_id: str):

    path = f"../runs/{job_id}/final_results.json"

    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data

    return {"items": []}

@app.get("/metrics/{job_id}")
def metrics(job_id: str):

    run_dir = f"../runs/{job_id}"

    if not os.path.exists(run_dir):
        return []

    ea = event_accumulator.EventAccumulator(run_dir)
    ea.Reload()

    tags = ea.Tags()["scalars"]

    if not tags:
        return {}

    data = {}

    # Return all available scalar metrics
    for tag in tags:
        try:
            events = ea.Scalars(tag)
            data[tag] = [
                {
                    "step": e.step,
                    "value": e.value
                }
                for e in events
            ]
        except:
            pass

    return data