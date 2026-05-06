"""
difficulty_scorer.py

Combines multiple metrics (length, rarity, perplexity if desired)
to produce a numeric difficulty score + bucket label.

Final output on each item:
{
    "difficulty_score": float,
    "difficulty": "easy" | "medium" | "hard"
}
"""

from typing import List, Dict, Optional
import numpy as np

from .length_metric import length_score
from .vocab_rarity_metric import VocabRarity


class DifficultyScorer:
    def __init__(self, corpus_texts: List[str]):
        """
        corpus_texts is used for computing vocabulary rarity.
        """
        self.vocab = VocabRarity(corpus_texts)

    def score_item(self, item: Dict) -> float:
        """
        Combine multiple difficulty metrics.
        You can expand this with perplexity if needed.
        """
        l = length_score(item)                # 0.6 weight
        v = self.vocab.rarity_score(item)     # 0.4 weight

        # combine with scaling
        score = (l * 0.6) + (v * 10.0 * 0.4)
        return float(score)

    def assign_bucket(self, score: float, p33: float, p66: float) -> str:
        if score <= p33:
            return "easy"
        elif score <= p66:
            return "medium"
        else:
            return "hard"

    def score_dataset(self, items: List[Dict]) -> List[Dict]:
        """
        Score entire dataset and assign buckets based on quantiles.
        """
        # compute numeric scores
        for it in items:
            it["difficulty_score"] = self.score_item(it)

        # quantile thresholds
        scores = [it["difficulty_score"] for it in items]
        p33 = float(np.percentile(scores, 33))
        p66 = float(np.percentile(scores, 66))

        # assign difficulty tiers
        for it in items:
            it["difficulty"] = self.assign_bucket(it["difficulty_score"], p33, p66)

        return items
