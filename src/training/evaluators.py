"""
Simple evaluator utilities for observing and reporting basic training metrics.
"""

import math
from typing import List, Dict, Optional


def perplexity_from_loss(loss: float) -> float:
    try:
        return float(math.exp(loss))
    except OverflowError:
        return float("inf")


class Evaluator:
    def __init__(self):
        self.history: Dict[str, List[float]] = {"loss": []}

    def observe(self, loss: float):
        self.history["loss"].append(float(loss))

    def mean_loss(self) -> Optional[float]:
        if not self.history["loss"]:
            return None
        return float(sum(self.history["loss"]) / len(self.history["loss"]))

    def reset(self):
        self.history = {"loss": []}
