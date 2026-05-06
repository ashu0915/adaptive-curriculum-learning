from transformers import AutoTokenizer
from typing import List


class TokenizerWrapper:
    def __init__(self, model_name: str, max_length: int = 512, pad_token: str = None):
        self.tokenizer = AutoTokenizer.from_pretrained(model_name, use_fast=True)
        if pad_token is not None:
            self.tokenizer.pad_token = pad_token
        self.max_length = max_length

    def __call__(self, texts: List[str]):
        return self.tokenizer(
            texts,
            truncation=True,
            padding=True,
            max_length=self.max_length,
            return_tensors='pt'
        )
