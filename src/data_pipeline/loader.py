from pathlib import Path
import json
import csv
from typing import List, Dict


def load_json(path: str) -> List[Dict]:
    path = Path(path)
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data


def load_txt(path: str, id_prefix: str = "txt_") -> List[Dict]:
    path = Path(path)
    items = []
    with open(path, 'r', encoding='utf-8') as f:
        for i, line in enumerate(f):
            text = line.strip()
            if not text:
                continue
            items.append({"id": f"{id_prefix}{i}", "text": text, "meta": {}})
    return items


def load_csv(path: str, text_col: str = 'text') -> List[Dict]:
    path = Path(path)
    items = []
    with open(path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader):
            text = row.get(text_col, '')
            items.append({"id": row.get('id', f'csv_{i}'), "text": text, "meta": row})
    return items


def save_jsonl(items: List[Dict], out_path: str):
    path = Path(out_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        for it in items:
            f.write(json.dumps(it, ensure_ascii=False) + '\n')
