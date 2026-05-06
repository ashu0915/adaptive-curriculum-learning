"""
Optional LoRA trainer using peft. If peft is unavailable, this provides a fallback that behaves like Trainer.
"""

import math
from typing import Any, Dict, Optional
from pathlib import Path

import torch
from torch.utils.data import DataLoader

from transformers import AutoModelForCausalLM, AutoTokenizer

from src.data_pipeline.dataset_builder import TextDataset, collate_fn
from src.utils.logger import get_logger
from src.utils.seed import set_seed
from src.training.checkpoints import save_checkpoint

# Attempt to import PEFT
try:
    from peft import get_peft_model, LoraConfig, TaskType
    PEFT_AVAILABLE = True
except Exception:
    PEFT_AVAILABLE = False


class LoRATrainer:
    def __init__(
        self,
        model_name_or_path: str,
        tokenizer_name_or_path: Optional[str] = None,
        lora_r: int = 8,
        lora_alpha: int = 32,
        lora_dropout: float = 0.05,
        target_modules: Optional[list] = None,
        device: str = "auto",
        seed: Optional[int] = None,
        logger_name: str = "lora_trainer",
    ):
        self.device = device if device != "auto" else ("cuda" if torch.cuda.is_available() else "cpu")
        self.logger = get_logger(logger_name)
        if seed is not None:
            set_seed(seed)

        self.tokenizer = AutoTokenizer.from_pretrained(tokenizer_name_or_path or model_name_or_path, use_fast=True)
        if self.tokenizer.pad_token is None:
            try:
                self.tokenizer.add_special_tokens({"pad_token": "<|pad|>"})
            except Exception:
                pass

        self.model = AutoModelForCausalLM.from_pretrained(model_name_or_path)
        self.model.resize_token_embeddings(len(self.tokenizer))
        # apply LoRA if available
        if PEFT_AVAILABLE:
            lora_config = LoraConfig(
                r=lora_r,
                lora_alpha=lora_alpha,
                target_modules=target_modules,
                lora_dropout=lora_dropout,
                task_type=TaskType.CAUSAL_LM,
            )
            self.model = get_peft_model(self.model, lora_config)
            self.logger.info("Applied LoRA via peft.")
        else:
            self.logger.warning("PEFT not available. Running full-finetune instead of LoRA.")

        self.model.to(self.device)

    def train(
        self,
        sampler: Any,
        epochs: int = 1,
        batch_size: int = 4,
        lr: float = 2e-4,
        weight_decay: float = 0.0,
        gradient_accumulation_steps: int = 1,
        save_every_steps: int = 500,
        eval_every_steps: int = 200,
        output_dir: str = "outputs/models",
        max_steps: Optional[int] = None,
    ):
        """
        Training loop similar to Trainer, but with LoRA model if available.
        """
        optimizer = torch.optim.AdamW(self.model.parameters(), lr=lr, weight_decay=weight_decay)
        global_step = 0
        total_items = len(sampler.items) if hasattr(sampler, "items") else 0
        estimated_steps_per_epoch = max(1, math.ceil((total_items or 100) / batch_size))

        for epoch in range(epochs):
            self.logger.info(f"LoRA Epoch {epoch+1}/{epochs}")
            steps_this_epoch = max(1, estimated_steps_per_epoch)
            for step in range(steps_this_epoch):
                batch_items = sampler.sample_batch(batch_size)
                ds = TextDataset(batch_items, self.tokenizer)
                dl = DataLoader(ds, batch_size=batch_size, collate_fn=collate_fn)

                for batch in dl:
                    self.model.train()
                    input_ids = batch["input_ids"].to(self.device)
                    attention_mask = batch["attention_mask"].to(self.device)

                    outputs = self.model(input_ids=input_ids, attention_mask=attention_mask, labels=input_ids)
                    loss = outputs.loss
                    loss_to_backprop = loss / gradient_accumulation_steps
                    loss_to_backprop.backward()

                    if (global_step + 1) % gradient_accumulation_steps == 0:
                        optimizer.step()
                        optimizer.zero_grad()

                    global_step += 1

                    if global_step % eval_every_steps == 0:
                        self.logger.info(f"[LoRA step {global_step}] loss={loss.item():.4f}")

                    if global_step % save_every_steps == 0:
                        ckpt = save_checkpoint(self.model, optimizer, global_step, output_dir)
                        self.logger.info(f"Saved LoRA checkpoint: {ckpt}")

                    if max_steps is not None and global_step >= max_steps:
                        break

                if max_steps is not None and global_step >= max_steps:
                    break

            if max_steps is not None and global_step >= max_steps:
                break

        # final export using HuggingFace method if peft used
        final_dir = Path(output_dir) / "final_model"
        final_dir.mkdir(parents=True, exist_ok=True)
        try:
            # if peft and model has save_pretrained it will store adapters
            self.model.save_pretrained(str(final_dir))
            self.logger.info(f"Saved final LoRA model to {final_dir}")
        except Exception as e:
            torch.save(self.model.state_dict(), str(final_dir / "model_state.pt"))
            self.logger.warning(f"Failed to save_pretrained for LoRA model, saved state_dict: {e}")

        return self.model
