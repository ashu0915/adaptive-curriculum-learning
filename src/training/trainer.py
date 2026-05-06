import torch
import torch.nn as nn
from torch.optim import Adam

class Trainer:
    def __init__(self, student_model, lr=3e-4):
        self.model = student_model
        self.device = student_model.device
        self.optimizer = Adam(self.model.parameters(), lr=lr)
        self.criterion = nn.CrossEntropyLoss(reduction="none")

    def train_step(self, texts):
        """
        Returns:
          avg_loss (float),
          per_example_losses (List[float])
        """
        inputs, labels = self.model.prepare_inputs(texts)
        inputs = inputs.to(self.device)
        labels = labels.to(self.device)

        self.model.train()
        logits = self.model(inputs)  # (B, num_classes)

        per_item_losses = self.criterion(logits, labels)  # shape (B,)
        loss = per_item_losses.mean()

        self.optimizer.zero_grad()
        loss.backward()
        self.optimizer.step()

        return (
            float(loss.item()),
            [float(x) for x in per_item_losses.detach().cpu().tolist()]
        )
