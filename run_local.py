#!/usr/bin/env python3
"""
FINAL Integrated run_local.py
Fully upgraded pipeline:
 - Initial difficulty scoring (teacher)
 - DatasetManager
 - Advanced pacing functions
 - PoolSampler (balanced optional)
 - DifficultyUpdater (α, inv, window)
 - TrainerWithKL (KL + CE loss)
 - TensorBoard logging via ACLLogger
 - Progress printing & safe termination
"""
import argparse
from pathlib import Path
import json
import torch

# -------- Imports from your modules --------
from src.data.dataset_loader import DatasetLoader
from src.difficulty.teacher import TeacherModel
from src.difficulty.initial_scorer import compute_initial_scores

from src.curriculum.dataset_manager import DatasetManager
from src.curriculum.advanced_pacing import AdvancedPacing
from src.curriculum.pool_sampler import PoolSampler
from src.curriculum.difficulty_updater import DifficultyUpdater

from src.models.student_model import StudentModel
from src.training.trainer_with_kl import TrainerWithKL

from src.utils.logger import ACLLogger


# -------------------------------------------------
# Helper Functions
# -------------------------------------------------

def create_teacher():
    """Teacher model for initial difficulty scoring."""
    return TeacherModel(
        model_name=args.teacher_model,
        task="causal_lm",
        device="cuda" if torch.cuda.is_available() else "cpu"
    )


def create_student():
    """Student model to be trained."""
    return StudentModel(
        device="cuda" if torch.cuda.is_available() else "cpu",
        model_name=args.student_model
    )


# -------------------------------------------------
# Main Training Routine
# -------------------------------------------------

def run_training(args):
    print("=== Loading dataset ===")
    items = DatasetLoader.load_jsonl(args.data)
    print(f"Loaded {len(items)} items.")

    # -------------------------------------------------
    # 1) INITIAL DIFFICULTY (if missing)
    # -------------------------------------------------
    if any("initial_difficulty" not in it for it in items):
        print("No initial difficulty found — computing using teacher model...")
        teacher = create_teacher()
        items = compute_initial_scores(
            items,
            model_name=teacher.model_name,
            task=teacher.task,
            batch_size=16,
            device=teacher.device
        )
        print("Initial difficulty computed.")
    else:
        print("Initial difficulty already present — skipping scoring.")

    # -------------------------------------------------
    # 2) DATASET MANAGER
    # -------------------------------------------------
    dm = DatasetManager(items)

    # -------------------------------------------------
    # 3) PACING FUNCTION
    # -------------------------------------------------
    pacing = AdvancedPacing(
        n=dm.size(),
        M=args.steps,
        kind=args.pacing,
        start_frac=args.start_frac,
        end_frac=args.end_frac,
        gamma=args.gamma,
        step_size=args.step_size
    )

    # -------------------------------------------------
    # 4) SAMPLER
    # -------------------------------------------------
    sampler = PoolSampler(
        dataset_manager=dm,
        pacing_fn=pacing,
        balanced=args.balanced,
        seed=args.seed
    )

    # -------------------------------------------------
    # 5) DIFFICULTY UPDATER
    # -------------------------------------------------
    updater = DifficultyUpdater(
        dataset_manager=dm,
        inv=args.inv,
        alpha=args.alpha,
        window_size=args.window
    )

    # -------------------------------------------------
    # 6) TEACHER + STUDENT + TRAINER
    # -------------------------------------------------
    teacher = create_teacher() if args.use_teacher else None
    student = create_student()

    trainer = TrainerWithKL(
        student_model=student,
        teacher_model=teacher,
        lambda_kld=args.lambda_kld,
        use_total_loss_for_difficulty=args.loss_for_diff
    )

    # -------------------------------------------------
    # 7) LOGGER
    # -------------------------------------------------
    logdir = Path(args.logdir)
    logdir.mkdir(parents=True, exist_ok=True)
    logger = ACLLogger(str(logdir))

    print("=== Starting Training ===")
    print(f"Total steps: {args.steps} | Batch size: {args.batch}")

    # -------------------------------------------------
    # 8) TRAINING LOOP
    # -------------------------------------------------
    for step in range(1, args.steps + 1):

        # ---- sample a batch ----
        batch_items = sampler.sample_batch(args.batch, m_step=step)
        texts = [x["text"] for x in batch_items]

        # ---- forward/backward ----
        loss, per_item_losses = trainer.train_step(texts)
        updater.observe_batch(batch_items, per_item_losses)

        # ---- curriculum update ----
        updates = updater.maybe_update()

        # ---- logging ----
        debug = trainer.last_debug
        logger.log_scalars({
            "loss/ce": debug["avg_ce"],
            "loss/kl": debug["avg_kl"],
            "loss/total": debug["avg_total"],
            "curriculum/pool_size": pacing.size_for(step),
        }, step)

        if step % max(1, args.steps // 10) == 0:
            all_scores = [it["difficulty_score"] for it in dm.items]
            logger.log_histogram("difficulty/all_scores", all_scores, step)
            print(f"Step {step}/{args.steps} | Loss={debug['avg_total']:.4f} | Pool={pacing.size_for(step)}")

    logger.close()

    # -------------------------------------------------
    # 9) SAVE RESULTS
    # -------------------------------------------------
    out_path = logdir / "final_results.json"
    out_path.write_text(json.dumps({"items": dm.items}, indent=2), encoding="utf-8")
    torch.save(student.model.state_dict(), logdir / "model.pt")
    print("\n=== Training Completed ===")
    print(f"Results saved to: {out_path}")


# -------------------------------------------------
# CLI ARGUMENTS
# -------------------------------------------------

def build_arg_parser():
    p = argparse.ArgumentParser(description="Run Adaptive Curriculum Learning locally")

    # Data
    p.add_argument("--data", type=str, required=True,
                   help="Path to input JSONL dataset")

    # Steps
    p.add_argument("--steps", type=int, default=200)
    p.add_argument("--batch", type=int, default=4)

    # Pacing
    p.add_argument("--pacing", type=str, default="exp_gamma",
                   choices=["fixed", "linear", "exponential", "exp_gamma", "polynomial", "step"])
    p.add_argument("--start_frac", type=float, default=0.05)
    p.add_argument("--end_frac", type=float, default=1.0)
    p.add_argument("--gamma", type=float, default=2.0)
    p.add_argument("--step_size", type=int, default=10)
    p.add_argument("--balanced", action="store_true", help="Use class-balanced sampling")

    # Difficulty updater
    p.add_argument("--inv", type=int, default=20)
    p.add_argument("--alpha", type=float, default=-0.01)
    p.add_argument("--window", type=int, default=1)
    p.add_argument("--loss_for_diff", action="store_true", help="Use CE+KL total loss for difficulty update")

    # Teacher / KL
    p.add_argument("--use_teacher", action="store_true", help="Enable KL distillation")
    p.add_argument("--lambda_kld", type=float, default=0.0)

    # Logging
    p.add_argument("--logdir", type=str, default="runs/local")
    p.add_argument("--seed", type=int, default=42)
    p.add_argument("--teacher_model", type=str, default="distilgpt2")
    p.add_argument("--student_model", type=str, default="sshleifer/tiny-gpt2")

    return p


# -------------------------------------------------
# Entry
# -------------------------------------------------

if __name__ == "__main__":
    args = build_arg_parser().parse_args()
    run_training(args)
