# src/curriculum/difficulty_updater.py
from typing import List, Dict, Optional
from collections import defaultdict, deque
import math

class DifficultyUpdater:
    """
    Observe per-example losses and update stored difficulty scores periodically.

    - inv: update interval (in mini-batches)
    - alpha: adaptation weight (can be negative)
    - window_size: if >1, we average observed recent losses for stability
    """

    def __init__(self, dataset_manager, inv: int = 50, alpha: float = -0.01, window_size: int = 1):
        """
        dataset_manager: DatasetManager instance (must implement get_item_by_id and update_difficulty_scores)
        inv: every 'inv' mini-batches, update difficulty scores
        alpha: adaptation parameter (paper suggests negative alpha)
        window_size: moving window of recent scur observations per example
        """
        self.dm = dataset_manager
        self.inv = max(1, int(inv))
        self.alpha = float(alpha)
        self.window_size = max(1, int(window_size))
        # map id -> deque of observed losses
        self._loss_windows = defaultdict(lambda: deque(maxlen=self.window_size))
        self._step = 0

    def observe_batch(self, batch_items: List[Dict], per_example_losses: List[float]):
        """
        batch_items: list of items (each with 'id')
        per_example_losses: list of float losses corresponding to batch_items
        """
        for it, loss in zip(batch_items, per_example_losses):
            _id = it.get('id')
            if _id is None: continue
            self._loss_windows[_id].append(float(loss))
        self._step += 1

    def maybe_update(self) -> Optional[Dict[str, float]]:
        """
        If it's time to update, compute s_cur per item (avg over window), then compute:
            s_new = (1 - alpha) * s_old + alpha * s_cur
        and call dataset_manager.update_difficulty_scores(updated_map)
        Returns updated_map or None if no update performed.
        """
        if (self._step % self.inv) != 0:
            return None

        updates = {}
        for _id, wnd in list(self._loss_windows.items()):
            if not wnd: continue
            s_cur = float(sum(wnd) / len(wnd))
            item = self.dm.get_item_by_id(_id)
            if item is None:
                continue
            s_old = float(item.get('difficulty_score', item.get('initial_difficulty', 0.0)))
            # apply update: s <- (1 - alpha) s_old + alpha * s_cur
            # Note: paper uses s_{k+1} = (1 - alpha) s_k + alpha s_cur (alpha negative recommended)
            s_new = (1.0 - self.alpha) * s_old + (self.alpha) * s_cur
            # sanity: keep finite numbers
            if not (math.isfinite(s_new)):
                s_new = s_old
            updates[_id] = float(s_new)

        if updates:
            self.dm.update_difficulty_scores(updates)
            # clear windows after update to start fresh
            self._loss_windows.clear()
            return updates
        return None
