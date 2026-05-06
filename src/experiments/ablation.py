# src/experiments/ablation.py
import argparse
import json
from pathlib import Path
from src.experiments.acl_experiment import ACLExperiment
from src.models.student_model import StudentModel
from src.difficulty.teacher import TeacherModel
from src.data.dataset_loader import DatasetLoader

def student_factory():
    return StudentModel(device="cuda" if __import__('torch').cuda.is_available() else "cpu")

def teacher_factory():
    return TeacherModel(model_name="distilgpt2", task="causal_lm",
                        device="cuda" if __import__('torch').cuda.is_available() else "cpu")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", type=str, default="datasets/sample.jsonl")
    parser.add_argument("--out_dir", type=str, default="runs/ablation")
    parser.add_argument("--steps", type=int, default=200)
    parser.add_argument("--batch", type=int, default=4)
    args = parser.parse_args()

    items = DatasetLoader.load_jsonl(args.data)
    Path(args.out_dir).mkdir(parents=True, exist_ok=True)

    # define configurations
    configs = [
        ("vanilla", dict(pacing_cfg={"kind":"fixed","start_frac":1.0,"end_frac":1.0},"pacing_cfg": {"balanced": False}), dict(trainer_cfg={"lambda_kld":0.0, "use_total_loss_for_difficulty":False})),
        ("fcl", dict(pacing_cfg={"kind":"fixed","start_frac":0.05,"end_frac":1.0,"balanced":False}), dict(trainer_cfg={"lambda_kld":0.0, "use_total_loss_for_difficulty":False})),
        ("acl_no_kl", dict(pacing_cfg={"kind":"exp_gamma","gamma":1.5,"balanced":False}), dict(trainer_cfg={"lambda_kld":0.0, "use_total_loss_for_difficulty":False},)),
        ("acl_with_kl", dict(pacing_cfg={"kind":"exp_gamma","gamma":1.5,"balanced":False}), dict(trainer_cfg={"lambda_kld":0.2,"use_total_loss_for_difficulty":True})),
        # you can add SPL config later
    ]

    for name, p_cfg, t_cfg in configs:
        print("Running:", name)
        ex = ACLExperiment(
            items=items,
            student_model_factory=student_factory,
            teacher_model_factory=teacher_factory,
            total_steps=args.steps,
            batch_size=args.batch,
            pacing_cfg=p_cfg,
            updater_cfg={"inv":20, "alpha":-0.01, "window_size":1},
            trainer_cfg=dict(t_cfg.get("trainer_cfg", {})),
            logdir=f"runs/ablation/{name}"
        )
        ex.prepare()
        ex.run()
        ex.save_results(f"runs/ablation/{name}/final_results.json")
        print("Finished:", name)

if __name__ == "__main__":
    main()
