# src/training/losses.py
import torch
import torch.nn.functional as F
from typing import Optional, Tuple

def per_example_ce(logits: torch.Tensor, labels: torch.Tensor) -> torch.Tensor:
    """
    logits: (B, C) for classification OR (B, seq_len, V) for LM (we will reduce)
    labels: (B,) for classification OR (B, seq_len) for LM (shifted labels expected)
    Returns: tensor shape (B,) per-example cross-entropy (averaged per token for LM)
    """

    if logits.dim() == 2:
        # classification
        loss = F.cross_entropy(logits, labels, reduction="none")
        return loss  # (B,)
    elif logits.dim() == 3:
        # LM case: logits (B, T, V), labels (B, T) - assume labels are aligned (teacher/student shift handled prior)
        B, T, V = logits.shape
        # flatten
        flat_logits = logits.view(-1, V)
        flat_labels = labels.view(-1)
        loss_flat = F.cross_entropy(flat_logits, flat_labels, reduction="none")  # (B*T,)
        loss = loss_flat.view(B, T)
        # mask padding tokens if label == -100 convention
        mask = (flat_labels.view(B, T) != -100).float()
        denom = mask.sum(dim=1).clamp(min=1.0)
        per_example = (loss * mask).sum(dim=1) / denom
        return per_example
    else:
        raise ValueError("Unsupported logits shape for CE")

def per_example_kl(teacher_logits: torch.Tensor,
                   student_logits: torch.Tensor,
                   attention_mask: Optional[torch.Tensor] = None,
                   temperature: float = 1.0) -> torch.Tensor:
    """
    Compute per-example KL(teacher || student).
    - For classification: teacher_logits (B, C), student_logits (B, C) -> return (B,)
    - For LM: teacher_logits (B, T, V), student_logits (B, T, V) -> average tokenwise KL per example (B,)
    teacher_logits and student_logits should be raw logits (not probs).
    temperature: distillation temperature > 0.
    """
    min_vocab = min(teacher_logits.shape[-1], student_logits.shape[-1])
    teacher_logits = teacher_logits[..., :min_vocab]
    student_logits = student_logits[..., :min_vocab]

    min_len = min(teacher_logits.shape[1], student_logits.shape[1])
    teacher_logits = teacher_logits[:, :min_len, :]
    student_logits = student_logits[:, :min_len, :]
    
    # Truncate attention mask to match sequence length
    if attention_mask is not None:
        attention_mask = attention_mask[:, :min_len]
    
    T = float(temperature)
    if teacher_logits.dim() == 2 and student_logits.dim() == 2:
        # classification
        t_logits = teacher_logits / T
        s_logits = student_logits / T
        t_logp = F.log_softmax(t_logits, dim=-1)   # (B, C)
        s_logp = F.log_softmax(s_logits, dim=-1)
        t_p = t_logp.exp()
        # KL per example: sum p_t * (log p_t - log p_s)
        kl = (t_p * (t_logp - s_logp)).sum(dim=-1)  # (B,)
        # multiply by T^2 as in distillation literature if you use temperature scaling
        return kl * (T * T)
    elif teacher_logits.dim() == 3 and student_logits.dim() == 3:
        # LM: compute token-wise KL and average per example (respecting attention_mask)
        t_logits = teacher_logits / T
        s_logits = student_logits / T
        t_logp = F.log_softmax(t_logits, dim=-1)  # (B, T, V)
        s_logp = F.log_softmax(s_logits, dim=-1)
        t_p = t_logp.exp()
        token_kl = (t_p * (t_logp - s_logp)).sum(dim=-1)  # (B, T)
        if attention_mask is not None:
            mask = attention_mask.float()
            denom = mask.sum(dim=1).clamp(min=1.0)
            per_example = (token_kl * mask).sum(dim=1) / denom
        else:
            per_example = token_kl.mean(dim=1)
        return per_example * (T * T)
    else:
        raise ValueError("Teacher and student logits shape mismatch or unsupported dims.")
