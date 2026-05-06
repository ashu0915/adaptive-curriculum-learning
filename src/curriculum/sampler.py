"""
Curriculum sampler.

Provides:
 - CurriculumSampler: sample a batch according to per-bucket probabilities.
 - Utility to rebuild internal buckets if dataset changes.
"""

from typing import List, Dict, Optional
import random
import threading

class CurriculumSampler:
    def __init__(self, items: List[Dict], sampling_probs: Optional[Dict[str, float]] = None, seed: Optional[int] = None):
        """
        items: list of dicts, each item must have 'difficulty' key with value in {'easy','medium','hard'} (or others).
        sampling_probs: dict mapping bucket -> probability (will be normalized).
        seed: optional RNG seed for determinism.
        """
        self.lock = threading.Lock()
        self.seed = seed
        if seed is not None:
            self._rng = random.Random(seed)
        else:
            self._rng = random.Random()
        self.set_items(items)
        self.set_sampling_probs(sampling_probs or {"easy": 0.7, "medium": 0.2, "hard": 0.1})

    def set_items(self, items: List[Dict]):
        """(Re)initialize the bucket index from items."""
        with self.lock:
            self.items = list(items)
            self.by_bucket: Dict[str, List[Dict]] = {}
            for it in self.items:
                b = it.get("difficulty", "easy")
                self.by_bucket.setdefault(b, []).append(it)

    def set_sampling_probs(self, sampling_probs: Dict[str, float]):
        """Set/normalize sampling probabilities. Missing buckets set to 0."""
        with self.lock:
            # include all buckets from data and sampling_probs
            buckets = set(list(self.by_bucket.keys()) + list(sampling_probs.keys()))
            # build probs map
            probs = {b: float(sampling_probs.get(b, 0.0)) for b in buckets}
            total = sum(probs.values())
            if total <= 0:
                # fallback: uniform over available buckets
                n = len(buckets) or 1
                probs = {b: 1.0/n for b in buckets}
            else:
                probs = {b: probs[b]/total for b in probs}
            self.sampling_probs = probs
            # precompute lists for random.choices-like sampling
            self._buckets = list(self.sampling_probs.keys())
            self._weights = [self.sampling_probs[b] for b in self._buckets]

    def sample_batch(self, batch_size: int) -> List[Dict]:
        """
        Sample exactly batch_size items according to sampling_probs.
        If a chosen bucket is empty, fallback to sampling uniformly from all items.
        """
        batch: List[Dict] = []
        with self.lock:
            for _ in range(batch_size):
                b = self._rng.choices(self._buckets, weights=self._weights, k=1)[0]
                bucket_list = self.by_bucket.get(b, [])
                if bucket_list:
                    batch.append(self._rng.choice(bucket_list))
                else:
                    # fallback to any available item
                    if self.items:
                        batch.append(self._rng.choice(self.items))
                    else:
                        raise ValueError("No items available to sample from.")
        return batch

    def update_probs(self, new_probs: Dict[str, float]):
        """Public method to update sampling probabilities (will normalize)."""
        self.set_sampling_probs(new_probs)

    def add_items(self, new_items: List[Dict]):
        """Add new items and rebuild buckets (keeps deterministic order)."""
        with self.lock:
            self.items.extend(new_items)
            for it in new_items:
                b = it.get("difficulty", "easy")
                self.by_bucket.setdefault(b, []).append(it)
