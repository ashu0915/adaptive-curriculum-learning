"""
perplexity_metric.py

Estimates perplexity using a small LM model (default: GPT-2).
This is optional but useful for ranking text difficulty by fluency.
"""

from transformers import AutoModelForCausalLM, AutoTokenizer
import torch
import math
from typing import List


class PerplexityEstimator:
    def __init__(self, model_name: str = "gpt2", device: str = "cpu"):
        self.device = device
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForCausalLM.from_pretrained(model_name).to(device)
        self.model.eval()

    def ppl(self, text: str) -> float:
        enc = self.tokenizer(text, return_tensors="pt", truncation=True)
        input_ids = enc["input_ids"].to(self.device)

        with torch.no_grad():
            outputs = self.model(input_ids, labels=input_ids)
            loss = outputs.loss.item()

        try:
            return float(math.exp(loss))
        except OverflowError:
            return float("inf")

    def batch_ppl(self, texts: List[str]) -> List[float]:
        return [self.ppl(t) for t in texts]
