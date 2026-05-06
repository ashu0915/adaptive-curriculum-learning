# src/difficulty/initial_scorer.py
import json
from pathlib import Path
from typing import List, Dict, Optional
from tqdm import tqdm
import torch

from src.difficulty.teacher import TeacherModel

def compute_initial_scores(
    items: List[Dict],
    model_name: str = "distilgpt2",
    task: str = "causal_lm",
    batch_size: int = 32,
    device: Optional[str] = None,
    label_key: str = "label",
    out_jsonl: Optional[str] = None,
):
    """
    Compute initial difficulty score s0 for each item and return updated items.

    items: list of dicts with at least 'id' and 'text'. If task == 'classification' and
           label_key present, label must be integer class id (0..C-1).
    model_name: pretrained teacher model
    task: 'classification' or 'causal_lm'
    batch_size: batch size for teacher inference
    out_jsonl: optional path to write items with scores
    """
    tm = TeacherModel(model_name=model_name, task=task, device=device)
    updated = []
    n = len(items)
    device = tm.device

    # process in batches
    for i in tqdm(range(0, n, batch_size), desc="Scoring (teacher)"):
        batch = items[i : i + batch_size]
        texts = [it.get("text", "") for it in batch]
        logits, enc = tm.predict_logits(texts)
        if task == "classification":
            # if labels available, compute CE; otherwise use 1 - max_prob
            labels = []
            has_labels = True
            for it in batch:
                if label_key not in it or it[label_key] is None:
                    has_labels = False
                    break
                labels.append(int(it[label_key]))
            if has_labels:
                labels_tensor = torch.tensor(labels, dtype=torch.long, device=device)
                per_example = tm.per_example_cross_entropy(logits, labels_tensor)  # CPU tensor
            else:
                per_example = tm.per_example_class_confidence(logits)
        else:
            # causal LM: compute per-example NLL
            input_ids = enc["input_ids"]
            attention_mask = enc.get("attention_mask", None)
            per_example = tm.per_example_lm_nll(logits, input_ids, attention_mask)  # CPU tensor

        # attach to items
        for j, it in enumerate(batch):
            score = float(per_example[j].item())
            # store both initial and current (start equal)
            it["initial_difficulty"] = score
            it["difficulty_score"] = score
            updated.append(it)
        
        # Clear GPU cache to prevent memory fragmentation
        if device.startswith("cuda"):
            torch.cuda.empty_cache()

    # optionally write to jsonl
    if out_jsonl is not None:
        p = Path(out_jsonl)
        p.parent.mkdir(parents=True, exist_ok=True)
        with p.open("w", encoding="utf-8") as f:
            for it in updated:
                f.write(json.dumps(it, ensure_ascii=False) + "\n")

    return updated
