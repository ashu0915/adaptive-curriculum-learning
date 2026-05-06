from pathlib import Path
import torch
from typing import Any, Dict, Optional


def save_checkpoint(model: Any, optimizer: Optional[torch.optim.Optimizer], step: int, out_dir: str):
    """
    Save a training checkpoint (model state + optimizer state if provided).
    """
    Path(out_dir).mkdir(parents=True, exist_ok=True)
    ckpt_path = Path(out_dir) / f"checkpoint_{step}.pt"
    state: Dict[str, Any] = {"model_state_dict": model.state_dict(), "step": step}
    if optimizer is not None:
        state["optimizer_state_dict"] = optimizer.state_dict()
    torch.save(state, ckpt_path)
    return str(ckpt_path)


def load_checkpoint(path: str, model: Any, optimizer: Optional[torch.optim.Optimizer] = None, map_location: str = "cpu"):
    """
    Load checkpoint into model (and optimizer if provided). Returns loaded step.
    """
    path = Path(path)
    if not path.exists():
        raise FileNotFoundError(f"Checkpoint not found: {path}")
    state = torch.load(path, map_location=map_location)
    model.load_state_dict(state["model_state_dict"])
    step = int(state.get("step", 0))
    if optimizer is not None and "optimizer_state_dict" in state:
        optimizer.load_state_dict(state["optimizer_state_dict"])
    return step
