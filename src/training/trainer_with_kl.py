# src/training/trainer_with_kl.py
import torch
import torch.nn as nn
from torch.optim import Adam
from typing import List, Tuple, Optional, Dict
from src.training.losses import per_example_ce, per_example_kl

class TrainerWithKL:
    def __init__(self,
                 student_model,
                 teacher_model = None,
                 lr: float = 3e-4,
                 lambda_kld: float = 0.1,
                 temp: float = 1.0,
                 use_total_loss_for_difficulty: bool = True,
                 device: Optional[str] = None):
        """
        student_model: PyTorch nn.Module with:
           - prepare_inputs(texts) -> input_ids tensor (and optionally labels tensor)
           - forward(inputs) -> logits
        teacher_model: an object with predict_logits(texts) -> logits, enc (or a callable that given texts returns logits)
                       or teacher_model can implement forward that accepts same tokenized inputs and returns logits.
                       If None, KL is skipped.
        lambda_kld: scaling weight for KL term
        temp: temperature for distillation
        use_total_loss_for_difficulty: if True, per-example used for difficulty updates = CE + lambda*KL; else only CE
        device: "cuda"/"cpu" or None to use student_model.device
        """
        self.student = student_model
        self.teacher = teacher_model
        self.device = device or getattr(student_model, "device", ("cuda" if torch.cuda.is_available() else "cpu"))
        self.student.model.to(self.device)
        self.lambda_kld = float(lambda_kld)
        self.temp = float(temp)
        self.use_total_loss_for_difficulty = bool(use_total_loss_for_difficulty)

        self.optimizer = Adam(self.student.model.parameters(), lr=lr)
        # for CE we will compute per-example using functional; keep a dummy
        self.ce_loss_fn = nn.CrossEntropyLoss(reduction="none")

    def _teacher_logits_for_batch(self, texts, tokenized_student_enc=None):
        """
        Returns teacher_logits and optionally attention_mask for LM.
        Accepts:
          - self.teacher.predict_logits(texts) -> (logits, enc) as implemented in teacher wrapper
          - or teacher.forward using the same enc as student (if provided)
        """
        if self.teacher is None:
            return None, None
        # If teacher has predict_logits (our teacher wrapper), use it:
        if hasattr(self.teacher, "predict_logits"):
            logits, enc = self.teacher.predict_logits(texts)
            # move to device if needed
            logits = logits.to(self.device)
            if isinstance(enc, dict):
                attention_mask = enc.get("attention_mask", None)
                if attention_mask is not None:
                    attention_mask = attention_mask.to(self.device)
                return logits, attention_mask
            return logits, None
        # fallback: try to use same enc as student and teacher.forward(enc)
        if tokenized_student_enc is not None and hasattr(self.teacher, "forward"):
            enc = tokenized_student_enc
            with torch.no_grad():
                out = self.teacher.forward(**enc)
                logits = out.logits if hasattr(out, "logits") else out
                return logits.to(self.device), enc.get("attention_mask", None)
        return None, None

    def train_step(self, texts: List[str]) -> Tuple[float, List[float]]:
        """
        Runs a single training step on a batch of texts.
        Returns:
          avg_loss (float),
          per_example_losses (list[float]) -- these are the values used by DifficultyUpdater depending on config
        Also returns internal diagnostics via attributes for debugging (teacher_ce, kl, etc).
        """
        # Prepare student inputs & labels using the model's helper
        enc_inputs = self.student.prepare_inputs(texts)  # expect a tuple (input_tensor, label_tensor) or dict
        # Support both tuple and dict
        if isinstance(enc_inputs, tuple) or isinstance(enc_inputs, list):
            inputs, labels = enc_inputs
            tokenized_enc = None
        elif isinstance(enc_inputs, dict):
            tokenized_enc = {k: v.to(self.device) for k, v in enc_inputs.items()}
            inputs = tokenized_enc.get("input_ids", None)
            labels = tokenized_enc.get("labels", None)
        else:
            raise ValueError("student.prepare_inputs should return (inputs, labels) or a dict")

        inputs = inputs.to(self.device)
        labels = labels.to(self.device)

        # forward student
        self.student.model.train()
        outputs = self.student.model(input_ids=inputs)
        student_logits = outputs.logits

        # per-example CE
        per_ce = per_example_ce(student_logits, labels)  # (B,) tensor on CPU or same device
        # move to device for backward
        per_ce_t = per_ce.to(self.device)

        # teacher logits
        teacher_logits, attention_mask = self._teacher_logits_for_batch(texts, tokenized_student_enc=enc_inputs if isinstance(enc_inputs, dict) else None)

        if teacher_logits is not None:
            # ensure teacher logits on same device
            teacher_logits = teacher_logits.to(self.device)
            per_kl = per_example_kl(teacher_logits, student_logits, attention_mask=attention_mask, temperature=self.temp)
            per_kl_t = per_kl.to(self.device)
        else:
            per_kl_t = None

        # Compose per-example total loss used for optimization
        if per_kl_t is not None:
            per_total = per_ce_t + (self.lambda_kld * per_kl_t)
        else:
            per_total = per_ce_t

        loss = per_total.mean()
        # backward step
        self.optimizer.zero_grad()
        loss.backward()
        self.optimizer.step()

        # prepare returned per-example losses for difficulty updater
        if self.use_total_loss_for_difficulty:
            per_for_difficulty = per_total.detach().cpu().tolist()
        else:
            per_for_difficulty = per_ce.detach().cpu().tolist()

        # also return diagnostics if needed (attached as attrs)
        self.last_debug = {
            "avg_ce": float(per_ce.mean().detach().cpu().item()),
            "avg_kl": float(per_kl.mean().detach().cpu().item()) if (per_kl_t is not None) else 0.0,
            "avg_total": float(loss.detach().cpu().item())
        }

        return float(loss.detach().cpu().item()), per_for_difficulty
