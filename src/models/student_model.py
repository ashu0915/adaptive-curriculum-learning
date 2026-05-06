# src/models/student_model.py

import torch
from transformers import AutoModelForMaskedLM, AutoTokenizer, AutoModelForCausalLM


class StudentModel:
    def __init__(self, model_name="sshleifer/tiny-gpt2", device="cpu"):
        self.device = device

        self.tokenizer = AutoTokenizer.from_pretrained(model_name)

        if self.tokenizer.pad_token is None:
            self.tokenizer.pad_token = self.tokenizer.eos_token
        if(model_name in ["sshleifer/tiny-gpt2", "distilgpt2"]):
            self.model = AutoModelForCausalLM.from_pretrained(model_name)
        else:
            self.model = AutoModelForMaskedLM.from_pretrained(model_name)

        self.model.to(device)

    def prepare_inputs(self, texts):
        """
        Convert text batch into tensors for training
        """
        enc = self.tokenizer(
            texts,
            padding=True,
            truncation=True,
            max_length=128,
            return_tensors="pt"
        )

        input_ids = enc["input_ids"].to(self.device)
        attention_mask = enc["attention_mask"].to(self.device)

        labels = input_ids.clone()

        return {
            "input_ids": input_ids,
            "labels": labels,
            "attention_mask": attention_mask
        }

    def __call__(self, input_ids):
        outputs = self.model(input_ids=input_ids)
        return outputs.logits