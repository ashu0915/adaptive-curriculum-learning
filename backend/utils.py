"""
Utility functions for data conversion and processing
"""
import csv
import json
import os
import shutil
from typing import List, Dict, Any
import zipfile
from pathlib import Path


def csv_to_jsonl(csv_path: str) -> str:
    """
    Convert a CSV file to JSONL format.
    Ensures 'text' field is present (required by dataset loader).
    Preserves or generates 'id' fields for tracking.
    
    Args:
        csv_path: Path to the CSV file
        
    Returns:
        Path to the generated JSONL file
        
    Raises:
        ValueError: If no text column is found
    """
    jsonl_path = csv_path.replace('.csv', '.jsonl')
    
    with open(csv_path, 'r', encoding='utf-8') as csv_file:
        reader = csv.DictReader(csv_file)
        
        if not reader.fieldnames:
            raise ValueError("CSV file is empty or invalid")
        
        # Find the text column (look for common names)
        text_column = None
        possible_names = ['text', 'content', 'data', 'sentence', 'document', 'description', 'message', 'query']
        
        # First, check if 'text' column exists
        if 'text' in reader.fieldnames:
            text_column = 'text'
        else:
            # Try to find alternative text column
            for name in possible_names:
                if name in reader.fieldnames:
                    text_column = name
                    break
        
        if not text_column:
            # If no text column found, use the first column
            text_column = reader.fieldnames[0]
        
        print(f"CSV: Using '{text_column}' column as text field")
        
        with open(jsonl_path, 'w', encoding='utf-8') as jsonl_file:
            for idx, row in enumerate(reader):
                if row and any(row.values()):
                    # Ensure 'text' field exists
                    if text_column != 'text':
                        row['text'] = row.pop(text_column)
                    
                    # Ensure 'id' field exists
                    if 'id' not in row or not row['id']:
                        row['id'] = str(idx)
                    
                    # Keep other fields as metadata
                    jsonl_file.write(json.dumps(row, ensure_ascii=False) + '\n')
    
    return jsonl_path


def merge_jsonl_files(file_paths: List[str], output_path: str) -> str:
    """
    Merge multiple JSONL files into a single JSONL file.
    Ensures each row has a unique 'id' field.
    
    Args:
        file_paths: List of paths to JSONL files
        output_path: Path for the output merged file
        
    Returns:
        Path to the merged JSONL file
    """
    global_id = 0
    
    with open(output_path, 'w', encoding='utf-8') as outfile:
        for file_path in file_paths:
            if os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8') as infile:
                    for line in infile:
                        if line.strip():
                            try:
                                obj = json.loads(line)
                                # Ensure each object has a unique 'id'
                                if 'id' not in obj:
                                    obj['id'] = str(global_id)
                                global_id += 1
                                outfile.write(json.dumps(obj) + '\n')
                            except json.JSONDecodeError as e:
                                print(f"Skipping invalid JSON in {file_path}: {e}")
    
    return output_path


def process_folder_upload(folder_path: str, job_id: str, data_dir: str) -> str:
    """
    Process a folder containing CSV/JSONL files and merge them into one JSONL file.
    Recursively searches for CSV and JSONL files in all subfolders.
    
    Args:
        folder_path: Path to the uploaded folder
        job_id: Unique job ID for the training session
        data_dir: Directory to store the output file
        
    Returns:
        Path to the merged JSONL file
        
    Raises:
        ValueError: If no CSV or JSONL files are found
    """
    jsonl_files = []
    csv_files = []
    
    # Recursively collect all CSV and JSONL files from all subfolders
    for root, dirs, files in os.walk(folder_path):
        for file in files:
            file_path = os.path.join(root, file)
            file_lower = file.lower()
            
            if file_lower.endswith('.csv'):
                csv_files.append(file_path)
                print(f"Found CSV: {file}")
            elif file_lower.endswith('.jsonl'):
                jsonl_files.append(file_path)
                print(f"Found JSONL: {file}")
    
    # Convert CSV files to JSONL
    for csv_file in csv_files:
        try:
            jsonl_file = csv_to_jsonl(csv_file)
            jsonl_files.append(jsonl_file)
            print(f"Converted CSV to JSONL: {os.path.basename(csv_file)}")
        except Exception as e:
            print(f"Error converting {csv_file}: {e}")
    
    # Merge all JSONL files
    if jsonl_files:
        print(f"Merging {len(jsonl_files)} JSONL file(s)...")
        output_path = os.path.join(data_dir, f"{job_id}.jsonl")
        merged_path = merge_jsonl_files(jsonl_files, output_path)
        
        # Count lines in merged file
        line_count = sum(1 for _ in open(merged_path))
        print(f"Merged file created: {merged_path} ({line_count} items)")
        return merged_path
    
    if csv_files:
        raise ValueError(f"Found {len(csv_files)} CSV file(s) but conversion failed")
    
    raise ValueError("No CSV or JSONL files found in the uploaded folder or its subfolders")


def extract_and_process_zip(zip_path: str, job_id: str, data_dir: str) -> str:
    """
    Extract a zip file and process all CSV/JSONL files within it.
    
    Args:
        zip_path: Path to the zip file
        job_id: Unique job ID for the training session
        data_dir: Directory to store the output file
        
    Returns:
        Path to the merged JSONL file
        
    Raises:
        ValueError: If zip file is invalid or contains no supported files
    """
    import tempfile
    
    # Validate zip file
    if not zipfile.is_zipfile(zip_path):
        raise ValueError("Upload is not a valid zip file")
    
    # Create a temporary directory for extraction
    temp_dir = tempfile.mkdtemp()
    try:
        # Extract zip file
        try:
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(temp_dir)
        except zipfile.BadZipFile as e:
            raise ValueError(f"Corrupted zip file: {str(e)}")
        
        # Process the extracted folder - this creates the output file in data_dir
        output_path = process_folder_upload(temp_dir, job_id, data_dir)
        return output_path
    finally:
        # Clean up temporary directory after output is written to data_dir
        shutil.rmtree(temp_dir, ignore_errors=True)


def validate_jsonl(file_path: str) -> bool:
    """
    Validate that a file is valid JSONL format.
    
    Args:
        file_path: Path to the JSONL file
        
    Returns:
        True if valid, False otherwise
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            for line in f:
                if line.strip():
                    json.loads(line)
        return True
    except (json.JSONDecodeError, IOError):
        return False


def get_file_stats(file_path: str) -> Dict[str, Any]:
    """
    Get statistics about a file.
    
    Args:
        file_path: Path to the file
        
    Returns:
        Dictionary containing file statistics
    """
    stats = {
        'size': os.path.getsize(file_path),
        'lines': 0,
        'file_type': os.path.splitext(file_path)[1]
    }
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            stats['lines'] = sum(1 for _ in f)
    except:
        pass
    
    return stats
