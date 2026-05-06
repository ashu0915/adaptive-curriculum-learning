# src/curriculum/pacing.py
from typing import Literal
import math

PacingKind = Literal["exponential", "linear", "step"]

class PacingFunction:
    """
    Pacing function p(m) -> size of sample pool X' at mini-batch index m (1-indexed).
    Args:
      n: total dataset size
      M: total number of minibatches (approx total training steps)
      kind: "exponential" | "linear" | "step"
      start_frac: initial fraction of data (p(1) = max(1, floor(start_frac * n)))
      end_frac: final fraction (p(M) = floor(end_frac * n))
      step_size: for "step" kind, increase every step_size batches (ignored otherwise)
      eps_floor: minimal 1
    Example usage:
      p = PacingFunction(n=1000, M=200, kind="exponential", start_frac=0.05, end_frac=1.0)
      size = p.size_for(m=10)
    """
    def __init__(self, n: int, M: int, kind: PacingKind = "exponential",
                 start_frac: float = 0.05, end_frac: float = 1.0,
                 step_size: int = 10):
        assert 0.0 < start_frac <= 1.0
        assert 0.0 < end_frac <= 1.0
        assert start_frac <= end_frac
        self.n = int(n)
        self.M = max(1, int(M))
        self.kind = kind
        self.start_frac = float(start_frac)
        self.end_frac = float(end_frac)
        self.step_size = max(1, int(step_size))

    def size_for(self, m: int) -> int:
        """
        Return integer size of X' for minibatch index m (1-indexed).
        """
        m = max(1, int(m))
        if self.kind == "linear":
            frac = self.start_frac + (self.end_frac - self.start_frac) * ((m - 1) / max(1, self.M - 1))
        elif self.kind == "exponential":
            # exponential interpolation between start_frac and end_frac
            if self.end_frac == self.start_frac:
                frac = self.start_frac
            else:
                # map t in [0,1]
                t = (m - 1) / max(1, self.M - 1)
                # use exponential curve: start * (end/start)^{t}
                ratio = (self.end_frac / self.start_frac) if self.start_frac > 0 else (self.end_frac)
                frac = self.start_frac * (ratio ** t)
        else:  # step
            step_idx = (m - 1) // self.step_size
            total_steps = max(1, math.ceil(self.M / self.step_size))
            frac = self.start_frac + (self.end_frac - self.start_frac) * (step_idx / max(1, total_steps - 1))
        size = int(math.floor(max(1, min(self.n, frac * self.n))))
        return size
