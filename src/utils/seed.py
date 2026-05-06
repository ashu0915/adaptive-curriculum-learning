"""
src/utils/seed.py

Sets random seeds for reproducibility across Python, numpy, and PyTorch (if available).
Handles cases when torch is not installed gracefully.
"""

import random
from typing import Optional

try:
    import numpy as np
except Exception:
    np = None  # type: ignore

try:
    import torch
except Exception:
    torch = None  # type: ignore


def set_seed(seed: Optional[int]):
    """
    Set seeds across standard libraries.

    Args:
        seed: integer seed. If None, does nothing.
    """
    if seed is None:
        return

    if not isinstance(seed, int):
        raise ValueError("seed must be an int or None")

    # Python stdlib
    random.seed(seed)

    # numpy
    if np is not None:
        try:
            np.random.seed(seed)
        except Exception:
            pass

    # torch
    if torch is not None:
        try:
            torch.manual_seed(seed)
            # For CUDA determinism where available:
            if torch.cuda.is_available():
                torch.cuda.manual_seed_all(seed)
                # Some options to improve determinism (may affect speed):
                try:
                    torch.backends.cudnn.deterministic = True
                    torch.backends.cudnn.benchmark = False
                except Exception:
                    pass
        except Exception:
            pass


if __name__ == "__main__":
    # small self-check
    set_seed(42)
    try:
        import numpy as np  # re-import safe
        a = np.random.rand(3)
        set_seed(42)
        b = np.random.rand(3)
        assert (a == b).all()
        print("numpy seed stable")
    except Exception:
        print("numpy not available or seed not stable")
    try:
        import torch
        a = torch.rand(3)
        set_seed(42)
        b = torch.rand(3)
        set_seed(42)
        c = torch.rand(3)
        # not asserting deterministic here (depends on build), just printing
        print("torch sample:", a, b, c)
    except Exception:
        print("torch not available")
