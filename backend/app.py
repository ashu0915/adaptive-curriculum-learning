from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
import subprocess
import uuid
import shutil
import os
import json
import zipfile
import tempfile
from pathlib import Path
from numpy import floor
from tensorboard.backend.event_processing import event_accumulator
from utils import csv_to_jsonl, process_folder_upload, extract_and_process_zip, get_file_stats

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


@app.post("/validate-data")
async def validate_data(dataset: UploadFile = File(...)):
    """Validate data format before training"""
    tmp_path = None
    
    try:
        # Create a temporary file to save the upload
        with tempfile.NamedTemporaryFile(delete=False, suffix=Path(dataset.filename).suffix) as tmp_file:
            tmp_path = tmp_file.name
            shutil.copyfileobj(dataset.file, tmp_file)
        
        file_ext = Path(dataset.filename).suffix.lower()
        validation_result = {
            "valid": False,
            "file_type": file_ext,
            "error": None,
            "warnings": [],
            "stats": {}
        }
        
        try:
            if file_ext == '.jsonl':
                # Validate JSONL format
                line_count = 0
                text_count = 0
                with open(tmp_path, 'r', encoding='utf-8') as f:
                    for line in f:
                        try:
                            obj = json.loads(line)
                            line_count += 1
                            if "text" in obj:
                                text_count += 1
                        except json.JSONDecodeError as e:
                            return {
                                "valid": False,
                                "file_type": file_ext,
                                "error": f"Invalid JSON at line {line_count + 1}: {str(e)}"
                            }
                
                if text_count < line_count:
                    validation_result["warnings"].append(
                        f"Not all records have 'text' field: {text_count}/{line_count}"
                    )
                
                validation_result["valid"] = text_count > 0
                validation_result["stats"] = {
                    "total_lines": line_count,
                    "lines_with_text": text_count
                }
                
            elif file_ext == '.csv':
                # Validate CSV format
                import csv
                with open(tmp_path, 'r', encoding='utf-8') as f:
                    reader = csv.DictReader(f)
                    
                    if not reader.fieldnames:
                        validation_result["error"] = "CSV file is empty"
                        return validation_result
                    
                    # Check for text column
                    text_column = None
                    possible_names = ['text', 'content', 'data', 'sentence', 'document', 'description']
                    
                    if 'text' in reader.fieldnames:
                        text_column = 'text'
                    else:
                        for name in possible_names:
                            if name in reader.fieldnames:
                                text_column = name
                                validation_result["warnings"].append(
                                    f"Using column '{name}' as text field (no 'text' column found)"
                                )
                                break
                    
                    if not text_column:
                        text_column = reader.fieldnames[0]
                        validation_result["warnings"].append(
                            f"Using first column '{text_column}' as text field"
                        )
                    
                    row_count = 0
                    for row in reader:
                        if row and any(row.values()):
                            row_count += 1
                    
                    validation_result["valid"] = row_count > 0
                    validation_result["stats"] = {
                        "total_rows": row_count,
                        "columns": reader.fieldnames,
                        "text_column": text_column
                    }
                    
            elif file_ext == '.zip':
                validation_result["valid"] = True
                validation_result["stats"] = {"message": "ZIP file validation deferred to extraction"}
                
            else:
                validation_result["error"] = f"Unsupported format: {file_ext}"
            
        except Exception as e:
            validation_result["error"] = str(e)
        
        return validation_result
        
    finally:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except:
                pass


@app.post("/train")
async def train(dataset: UploadFile = File(...), model_name: str = Form(...)):
    tmp_path = None
    
    try:
        model_name = 'distilbert-base-uncased'

        job_id = str(uuid.uuid4())
        dataset_path2 = f"{DATA_DIR2}/{job_id}"
        
        print(f"[{job_id}] Starting training job with file: {dataset.filename}")
        
        # Create a temporary file to save the upload
        with tempfile.NamedTemporaryFile(delete=False, suffix=Path(dataset.filename).suffix) as tmp_file:
            tmp_path = tmp_file.name
            shutil.copyfileobj(dataset.file, tmp_file)
        
        print(f"[{job_id}] Uploaded file saved to: {tmp_path}")
        
        # Determine file type and convert if necessary
        file_ext = Path(dataset.filename).suffix.lower()
        jsonl_output_path = None
        
        try:
            if file_ext == '.jsonl':
                # Already JSONL, just copy it
                print(f"[{job_id}] Processing JSONL file")
                os.makedirs(DATA_DIR2, exist_ok=True)
                jsonl_output_path = f"{dataset_path2}.jsonl"
                shutil.copy(tmp_path, jsonl_output_path)
                print(f"[{job_id}] JSONL file copied: {jsonl_output_path}")
                
            elif file_ext == '.csv':
                # Convert CSV to JSONL
                print(f"[{job_id}] Converting CSV to JSONL")
                os.makedirs(DATA_DIR2, exist_ok=True)
                jsonl_output_path = csv_to_jsonl(tmp_path)
                # Move to the data directory
                final_path = f"{dataset_path2}.jsonl"
                shutil.move(jsonl_output_path, final_path)
                jsonl_output_path = final_path
                print(f"[{job_id}] CSV converted and moved: {jsonl_output_path}")
                
            elif file_ext == '.zip':
                # Extract and process folder
                print(f"[{job_id}] Extracting and processing ZIP file")
                os.makedirs(DATA_DIR2, exist_ok=True)
                jsonl_output_path = extract_and_process_zip(tmp_path, job_id, DATA_DIR2)
                print(f"[{job_id}] ZIP processed: {jsonl_output_path}")
                
            else:
                raise ValueError(f"Unsupported file format: {file_ext}. Supported formats: .jsonl, .csv, .zip")
            
            if not jsonl_output_path:
                raise ValueError("Failed to process the uploaded file")
                
        except ValueError as e:
            raise HTTPException(status_code=400, detail=f"Data conversion error: {str(e)}")
        except Exception as e:
            import traceback
            error_msg = f"File processing error: {str(e)}\n{traceback.format_exc()}"
            print(f"[{job_id}] {error_msg}")
            raise HTTPException(status_code=400, detail=f"File processing error: {str(e)}")
        
        # Use the JSONL file for training
        dataset_path = f"{DATA_DIR}/{job_id}.jsonl"
        shutil.copy(jsonl_output_path, dataset_path)
        print(f"[{job_id}] Final dataset: {dataset_path}")
        
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
        
        return {"job_id": job_id, "file_type": file_ext}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")
    finally:
        # Clean up temporary file
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except:
                pass


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