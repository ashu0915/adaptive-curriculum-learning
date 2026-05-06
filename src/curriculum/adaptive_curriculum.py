"""
Adaptive curriculum controller.

- Observes losses per batch (associated with sampled items).
- Maintains short-term averages of losses per bucket.
- Periodically computes new sampling probabilities, favoring buckets with higher recent loss.
- Smooths updates to avoid instability.
"""

from typing import Dict, List, Optional
import collections
import math


class AdaptiveCurriculumController:
    def __init__(
        self,
        initial_probs: Optional[Dict[str, float]] = None,
        update_every_steps: int = 500,
        smoothing: float = 0.9,
        min_easy: float = 0.02,
        max_hard: float = 0.7,
        window_size: int = 1000,
    ):
        """
        initial_probs: starting sampling distribution over buckets, e.g. {"easy":0.7,"medium":0.2,"hard":0.1}
        update_every_steps: how often (in observed batch calls) to recompute probs
        smoothing: [0,1) how much to keep previous probs when updating (higher = smoother)
        min_easy / max_hard: clamps to prevent degenerate distributions
        window_size: number of recent loss observations to keep per bucket
        """
        if initial_probs is None:
            initial_probs = {"easy": 0.7, "medium": 0.2, "hard": 0.1}
        # normalize
        total = sum(initial_probs.values()) or 1.0
        self.probs: Dict[str, float] = {k: float(v) / total for k, v in initial_probs.items()}
        self.update_every_steps = max(1, int(update_every_steps))
        self.smoothing = float(smoothing)
        self.min_easy = float(min_easy)
        self.max_hard = float(max_hard)
        self.window_size = int(window_size)

        self.step = 0
        self.bucket_losses: Dict[str, collections.deque] = {k: collections.deque(maxlen=self.window_size) for k in self.probs.keys()}

    def observe_batch(self, batch_items: List[Dict], batch_loss: float):
        """
        Record loss for the buckets represented in batch_items.
        batch_items: list of items (each item must have 'difficulty' key).
        batch_loss: scalar loss for that batch (should be computed by trainer).
        """
        self.step += 1
        if not batch_items:
            return

        # distribute the batch loss equally among bucket occurrences
        for it in batch_items:
            b = it.get("difficulty", "easy")
            if b not in self.bucket_losses:
                # lazily add new bucket
                self.bucket_losses[b] = collections.deque(maxlen=self.window_size)
                # also make sure probs has an entry
                if b not in self.probs:
                    self.probs[b] = 0.0
            self.bucket_losses[b].append(float(batch_loss))

    def _mean_loss(self, bucket: str) -> float:
        arr = self.bucket_losses.get(bucket, None)
        if not arr:
            return 0.0
        return float(sum(arr) / len(arr))

    def maybe_update(self) -> Dict[str, float]:
        """
        If enough steps have passed, recompute sampling probabilities and return them.
        Otherwise return current probs.
        """
        if (self.step % self.update_every_steps) != 0:
            return dict(self.probs)

        # compute mean losses per bucket
        means = {b: self._mean_loss(b) for b in self.probs.keys()}

        # If all zeros (no info), keep current probs.
        if all(v == 0.0 for v in means.values()):
            return dict(self.probs)

        # Convert mean losses into sampling preferences: higher loss -> higher sampling weight.
        # Add small epsilon to avoid divide-by-zero.
        eps = 1e-8
        raw = {b: float(means[b]) + eps for b in means}

        # Normalize raw to probabilities (proportional to raw)
        s = sum(raw.values())
        new_probs = {b: raw[b] / s for b in raw}

        # Apply clamping for domain-specific constraints
        if "easy" in new_probs:
            new_probs["easy"] = max(self.min_easy, new_probs["easy"])
        if "hard" in new_probs:
            new_probs["hard"] = min(self.max_hard, new_probs["hard"])

        # Renormalize after clamps
        s2 = sum(new_probs.values()) or 1.0
        new_probs = {b: new_probs[b] / s2 for b in new_probs}

        # Smooth update with previous probs
        smoothed = {}
        for b in new_probs:
            prev = self.probs.get(b, 0.0)
            smoothed[b] = float(self.smoothing * prev + (1.0 - self.smoothing) * new_probs[b])

        # Ensure keys exist for buckets that might be in previous probs but not in new_probs
        for b in list(self.probs.keys()):
            if b not in smoothed:
                smoothed[b] = self.probs[b]

        # Renormalize final smoothed dict
        total_final = sum(smoothed.values()) or 1.0
        smoothed = {b: smoothed[b] / total_final for b in smoothed}

        # Update internal state and clear observed losses
        self.probs = smoothed
        # reset loss windows to avoid immediate repeated influence
        for k in list(self.bucket_losses.keys()):
            self.bucket_losses[k].clear()

        return dict(self.probs)
