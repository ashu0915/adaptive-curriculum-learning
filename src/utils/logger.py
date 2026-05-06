# src/utils/logger.py
from torch.utils.tensorboard import SummaryWriter
import os
import numpy as np

class ACLLogger:
    def __init__(self, logdir="runs/acl"):
        os.makedirs(logdir, exist_ok=True)
        self.writer = SummaryWriter(log_dir=logdir)

    def log_scalars(self, scalar_dict: dict, step: int):
        for key, val in scalar_dict.items():
            self.writer.add_scalar(key, val, step)

    def log_histogram(self, name: str, values, step: int):
        if isinstance(values, list):
            values = np.array(values)
        self.writer.add_histogram(name, values, step)

    def close(self):
        self.writer.close()
