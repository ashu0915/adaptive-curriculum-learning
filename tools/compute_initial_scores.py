# tools/compute_initial_scores.py
import json
from pathlib import Path
from argparse import ArgumentParser
from src.data_pipeline.loader import load_json
from src.difficulty.initial_scorer import compute_initial_scores

def main():
    p = ArgumentParser()
    p.add_argument("--data", type=str, required=True, help="path to input jsonl file")
    p.add_argument("--out", type=str, default="datasets/with_s0.jsonl")
    p.add_argument("--model", type=str, default="distilgpt2")
    p.add_argument("--task", type=str, default="causal_lm", choices=["causal_lm", "classification"])
    p.add_argument("--batch_size", type=int, default=8)
    p.add_argument("--label_key", type=str, default="label")
    args = p.parse_args()

    items = []
    with open(args.data, "r", encoding="utf-8") as f:
        for line in f:
            if not line.strip(): continue
            items.append(json.loads(line))

    updated = compute_initial_scores(
        items,
        model_name=args.model,
        task=args.task,
        batch_size=args.batch_size,
        label_key=args.label_key,
        out_jsonl=args.out
    )
    print(f"Scored {len(updated)} items -> wrote {args.out}")

if __name__ == "__main__":
    main()
