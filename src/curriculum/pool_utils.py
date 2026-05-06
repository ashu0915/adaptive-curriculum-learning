# src/curriculum/pool_utils.py
from typing import List, Dict
from collections import defaultdict
import random

def balanced_pool_from_sorted(sorted_items: List[Dict], pool_size:int, label_key:str="label", rng=None):
    """
    Given a sorted list (easy -> hard), produce a balanced pool with near-equal counts per label.
    If label_key missing, return first pool_size items.
    """
    rng = rng or random.Random(0)
    grouped = defaultdict(list)
    has_label = False
    for it in sorted_items:
        lbl = it.get(label_key, None)
        if lbl is not None:
            has_label = True
        grouped[lbl].append(it)
    if not has_label:
        return list(sorted_items[:pool_size])
    labels = [k for k in grouped.keys() if k is not None]
    per_label = max(1, pool_size // len(labels))
    pool = []
    for lbl in labels:
        group = grouped[lbl]
        # take easiest per label (group is already in sorted order by difficulty)
        pool.extend(group[:per_label])
    # fill remainder from easiest remaining
    if len(pool) < pool_size:
        for it in sorted_items:
            if it not in pool:
                pool.append(it)
                if len(pool) >= pool_size:
                    break
    rng.shuffle(pool)
    return pool[:pool_size]
