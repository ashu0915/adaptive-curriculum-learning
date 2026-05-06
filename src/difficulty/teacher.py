# src/difficulty/teacher.py
from typing import Optional
import torch
from transformers import AutoModelForSequenceClassification, AutoModelForCausalLM, AutoTokenizer
import math

class TeacherModel:
    """
    Wrapper for a pretrained teacher model. Supports:
      - classification (AutoModelForSequenceClassification)
      - causal LM (AutoModelForCausalLM)
    """

    def __init__(self, model_name: str, task: str = "classification", device: Optional[str] = None):
        assert task in ("classification", "causal_lm"), "task must be 'classification' or 'causal_lm'"
        self.model_name = model_name
        self.task = task
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")

        # Load tokenizer
        self.tokenizer = AutoTokenizer.from_pretrained(model_name, use_fast=True)
        if self.tokenizer.pad_token is None:
            # For classification/pooling it's OK; for LM we set pad_token to eos_token if missing
            if hasattr(self.tokenizer, "eos_token") and self.tokenizer.eos_token is not None:
                self.tokenizer.pad_token = self.tokenizer.eos_token
            else:
                # create a pad token
                self.tokenizer.add_special_tokens({"pad_token": "[PAD]"})

        # Load model
        if task == "classification":
            self.model = AutoModelForSequenceClassification.from_pretrained(model_name)
        else:
            self.model = AutoModelForCausalLM.from_pretrained(model_name)

        self.model.to(self.device)
        self.model.eval()

    def predict_logits(self, texts, **tokenize_kwargs):
        """
        Tokenize inputs and return the raw logits (no softmax) as torch.Tensor.
        Returns: logits tensor (batch_size, num_labels) for classification
                 or (batch_size, seq_len, vocab_size) for LM (we return lm logits)
        """
        enc = self.tokenizer(texts, return_tensors="pt", padding=True, truncation=True, **tokenize_kwargs)
        enc = {k: v.to(self.device) for k, v in enc.items()}
        with torch.no_grad():
            # Use mixed precision for faster inference on GPU
            if self.device.startswith("cuda"):
                with torch.autocast(device_type="cuda", dtype=torch.float16):
                    out = self.model(**enc)
            else:
                out = self.model(**enc)
            
            if self.task == "classification":
                logits = out.logits  # (B, num_labels)
                return logits, enc
            else:
                # For causal LM huggingface returns logits
                logits = out.logits  # (B, seq_len, vocab_size)
                return logits, enc

    def per_example_cross_entropy(self, logits, labels):
        """
        Compute per-example cross entropy for classification logits.
        logits: (B, C)
        labels: torch.LongTensor (B,)
        returns: tensor (B,) with CE loss
        """
        import torch.nn.functional as F
        log_probs = torch.log_softmax(logits, dim=-1)  # (B, C)
        # gather
        nll = -log_probs[range(labels.size(0)), labels]  # (B,)
        return nll.detach().cpu()

    def per_example_class_confidence(self, logits):
        """
        Return 1 - max_prob as difficulty measure (higher -> harder).
        """
        import torch.nn.functional as F
        probs = torch.softmax(logits, dim=-1)
        maxp, _ = torch.max(probs, dim=-1)
        return (1.0 - maxp).detach().cpu()

    def per_example_lm_nll(self, logits, input_ids, attention_mask=None):
        """
        Compute per-example negative log likelihood (average per-token loss).
        logits: (B, seq_len, V)
        input_ids: (B, seq_len)
        attention_mask: optional tensor (B, seq_len)
        returns: tensor (B,) average token NLL per example
        """
        import torch.nn.functional as F
        # shift logits and labels according to causal lm convention
        # logits[:, :-1, :] -> predict tokens 1..T-1 from 0..T-2
        shift_logits = logits[:, :-1, :].contiguous()
        shift_labels = input_ids[:, 1:].contiguous()
        if attention_mask is not None:
            shift_mask = attention_mask[:, 1:].contiguous()
        else:
            shift_mask = (shift_labels != self.tokenizer.pad_token_id).long()

        vocab_size = shift_logits.size(-1)
        # flatten
        loss_fct = torch.nn.CrossEntropyLoss(reduction="none")
        flat_logits = shift_logits.view(-1, vocab_size)
        flat_labels = shift_labels.view(-1)
        flat_losses = loss_fct(flat_logits, flat_labels)  # (B*(T-1),)
        # reshape and mask
        losses = flat_losses.view(shift_labels.size(0), shift_labels.size(1))
        mask = shift_mask.float()
        per_example_loss = (losses * mask).sum(dim=1) / (mask.sum(dim=1).clamp(min=1.0))
        return per_example_loss.detach().cpu()
