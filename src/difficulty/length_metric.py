"""
length_metric.py

Simple difficulty metric based on token/word count.
Longer texts are considered harder.
"""

from typing import Dict


def length_score(item: Dict) -> float:
    text = item.get("text", "")
    # simple word-based length
    return float(len(text.split()))
