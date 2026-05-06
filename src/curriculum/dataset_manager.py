# src/curriculum/dataset_manager.py
from typing import List, Dict, Optional, Tuple
from pathlib import Path
import json
import bisect
import random
from collections import defaultdict

class DatasetManager:
    """
    Manage items with per-example difficulty scores, sorting and producing sample pools.

    Items are expected to be dicts with at least:
      - 'id' : str (unique)
      - 'text' : str
      - optional 'label' : int or str (if present, class balancing can be used)

    This manager keeps an internal sorted list of items by 'difficulty_score' ascending (easy first).
    """

    def __init__(self, items: List[Dict]):
        # copy to internal list
        self.items = list(items)
        # map id->index for quick updates (keeps updated after resort)
        self.id_to_idx = {it['id']: i for i, it in enumerate(self.items)}
        # ensure every item has difficulty_score key
        for it in self.items:
            if 'difficulty_score' not in it:
                it['difficulty_score'] = float(it.get('initial_difficulty', 0.0))
            if 'initial_difficulty' not in it:
                it['initial_difficulty'] = float(it['difficulty_score'])
        # build sorted index
        self._resort_internal()

    def _resort_internal(self):
        # sort items ascending by difficulty_score
        self.items.sort(key=lambda x: float(x.get('difficulty_score', 0.0)))
        self.id_to_idx = {it['id']: i for i, it in enumerate(self.items)}

    def resort(self):
        """Public resort (call after updating difficulty_score on many items)."""
        self._resort_internal()

    def update_difficulty_scores(self, updates: Dict[str, float]):
        """
        updates: mapping item_id -> new_score (float). We update in-place then resort.
        """
        for _id, sc in updates.items():
            idx = self.id_to_idx.get(_id, None)
            if idx is None:
                continue
            self.items[idx]['difficulty_score'] = float(sc)
        # after mass updates, resort
        self._resort_internal()

    def get_sample_pool(self, pool_size: int, balanced: bool = False) -> List[Dict]:
        """
        Return the first pool_size items (easy ones). If balanced == True and items have 'label',
        we will attempt to make the pool class-balanced by taking equal counts from each class,
        up to the requested pool_size.
        """
        pool_size = max(1, min(pool_size, len(self.items)))
        if not balanced:
            return list(self.items[:pool_size])

        # balanced selection
        # group indices by label preserving order
        label_groups = defaultdict(list)
        has_label = False
        for it in self.items[:pool_size * 3]:  # scan a bit deeper to allow balancing
            if 'label' in it and it['label'] is not None:
                has_label = True
                label_groups[it['label']].append(it)
            else:
                # put under None
                label_groups[None].append(it)

        if not has_label:
            # fall back to simple pool
            return list(self.items[:pool_size])

        labels = list(label_groups.keys())
        num_labels = len([l for l in labels if l is not None])
        if num_labels == 0:
            return list(self.items[:pool_size])

        per_label = max(1, pool_size // num_labels)
        pool = []
        for lbl in labels:
            if lbl is None:
                continue
            group = label_groups.get(lbl, [])
            pool.extend(group[:per_label])
        # if underfilled, fill from easiest remaining
        if len(pool) < pool_size:
            for it in self.items:
                if it not in pool:
                    pool.append(it)
                    if len(pool) >= pool_size: break
        return pool[:pool_size]

    def get_item_by_id(self, item_id: str) -> Optional[Dict]:
        idx = self.id_to_idx.get(item_id, None)
        if idx is None: return None
        return self.items[idx]

    def add_or_update_items(self, new_items: List[Dict]):
        """
        Add new items or update existing ones (by id). After adding, resort.
        """
        for it in new_items:
            _id = it.get('id')
            if _id is None:
                continue
            existing = self.get_item_by_id(_id)
            if existing is not None:
                existing.update(it)
            else:
                self.items.append(it)
        self._resort_internal()

    def size(self) -> int:
        return len(self.items)
