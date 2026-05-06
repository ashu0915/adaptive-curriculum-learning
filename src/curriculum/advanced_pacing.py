# src/curriculum/advanced_pacing.py
from typing import Literal
import math

PacingKind = Literal["exp_gamma", "exponential", "linear", "polynomial", "step", "fixed"]

class AdvancedPacing:
    """
    Pacing variants:
      - exponential: same as earlier
      - exp_gamma: exponential with gamma controlling growth speed
      - polynomial: (m/M)^gamma interpolation
    """
    def __init__(self, n:int, M:int, kind:PacingKind="exp_gamma",
                 start_frac:float=0.05, end_frac:float=1.0, gamma:float=2.0, step_size:int=10):
        assert 0 < start_frac <= 1.0
        assert 0 < end_frac <= 1.0
        assert start_frac <= end_frac
        self.n = int(n)
        self.M = max(1, int(M))
        self.kind = kind
        self.start = float(start_frac)
        self.end = float(end_frac)
        self.gamma = float(gamma)
        self.step_size = max(1, int(step_size))

    def size_for(self, m:int) -> int:
        m = max(1, int(m))
        t = (m - 1) / max(1, self.M - 1)  # in [0,1]
        if self.kind == "exponential":
            ratio = (self.end / self.start) if self.start>0 else self.end
            frac = self.start * (ratio ** t)
        elif self.kind == "exp_gamma":
            # exp with gamma: start * (end/start)^{t^gamma}
            ratio = (self.end / self.start) if self.start>0 else self.end
            frac = self.start * (ratio ** (t ** self.gamma))
        elif self.kind == "polynomial":
            frac = self.start + (self.end - self.start) * (t ** self.gamma)
        elif self.kind == "linear":
            frac = self.start + (self.end - self.start) * t
        elif self.kind == "step":
            idx = (m-1)//self.step_size
            total = max(1, math.ceil(self.M / self.step_size))
            frac = self.start + (self.end - self.start) * (idx / max(1, total-1))
        else:  # fixed
            frac = self.end
        size = int(max(1, min(self.n, math.floor(frac * self.n))))
        return size
