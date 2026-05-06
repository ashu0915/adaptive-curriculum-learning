# src/curriculum/pool_sampler.py
from typing import List, Dict, Optional
import random

class PoolSampler:
    """
    Sample batches uniformly from the current sample pool X'.
    Uses DatasetManager.get_sample_pool(pool_size, balanced=...) to get pool.
    """

    def __init__(self, dataset_manager, pacing_fn, balanced: bool = False, seed: Optional[int] = None):
        self.dm = dataset_manager
        self.pacing_fn = pacing_fn
        self.balanced = bool(balanced)
        self._rng = random.Random(seed)

    def sample_batch(self, batch_size: int, m_step: int):
        """
        m_step: current minibatch index (1-indexed). Uses pacing_fn.size_for(m_step) to build pool.
        Returns list of items (dicts).
        """
        pool_size = self.pacing_fn.size_for(m_step)
        pool = self.dm.get_sample_pool(pool_size, balanced=self.balanced)
        if not pool:
            return []
        batch = []
        for _ in range(batch_size):
            batch.append(self._rng.choice(pool))
        return batch

    def sample_epoch_iterator(self, batch_size: int, total_steps: int):
        """
        Iterate total_steps steps; returns generator yielding batches.
        (Useful for trainer loops that know how many steps per epoch)
        """
        for m in range(1, total_steps + 1):
            yield self.sample_batch(batch_size, m)
