import os
import uuid
import subprocess
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

app = FastAPI()

RUNS_DIR = "/app/runs"
os.makedirs(RUNS_DIR, exist_ok=True)

class RunRequest(BaseModel):
    dataset: str
    text_column: str = "title"
    label_column: str = "label"
    steps: int = 1000
    batch_size: int = 16

jobs = {}

@app.post("/run")
def run_training(req: RunRequest):

    job_id = str(uuid.uuid4())
    output_dir = f"{RUNS_DIR}/{job_id}"
    os.makedirs(output_dir, exist_ok=True)

    cmd = [
        "python",
        "/app/run_local.py",
        "--csv", f"/app/datasets/{req.dataset}",
        "--text-column", req.text_column,
        "--label-column", req.label_column,
        "--output", output_dir,
        "--steps", str(req.steps),
        "--batch-size", str(req.batch_size),
        "--use-teacher",
        "--teacher-model", "distilgpt2",
        "--student-model", "sshleifer/tiny-gpt2",
    ]

    process = subprocess.Popen(cmd)
    jobs[job_id] = process.pid

    return {"job_id": job_id}

@app.get("/status/{job_id}")
def status(job_id: str):

    if job_id not in jobs:
        return {"status": "unknown"}

    pid = jobs[job_id]

    try:
        os.kill(pid, 0)
        return {"status": "running"}
    except:
        return {"status": "finished"}

@app.get("/download/{job_id}")
def download(job_id: str):

    path = f"{RUNS_DIR}/{job_id}/checkpoint_step_1000.pt"

    if os.path.exists(path):
        return FileResponse(path)

    return {"error": "file not found"}