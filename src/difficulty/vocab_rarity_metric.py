"""
vocab_rarity_metric.py

Computes rarity score of vocabulary using corpus-wide word frequencies.
Rare words = higher difficulty.

We use 1 / (1 + freq[word]) to compute rarity contribution.
"""

from typing import Dict, List
from collections import Counter


class VocabRarity:
    def __init__(self, corpus_texts: List[str]):
        tokens = []
        for t in corpus_texts:
            tokens.extend(t.split())

        self.freq = Counter(tokens)
        self.total = sum(self.freq.values())

    def rarity_score(self, item: Dict) -> float:
        text = item.get("text", "")
        tokens = text.split()

        if not tokens:
            return 0.0

        score = 0.0
        for t in tokens:
            score += 1.0 / (1 + self.freq.get(t, 0))

        return score / len(tokens)
