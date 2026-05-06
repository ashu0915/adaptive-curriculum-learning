# src/experiments/acl_experiment.py
from typing import List, Dict, Optional
from pathlib import Path
import json
import time
import torch

from src.difficulty.initial_scorer import compute_initial_scores
from src.curriculum.dataset_manager import DatasetManager
from src.curriculum.advanced_pacing import AdvancedPacing
from src.curriculum.pool_sampler import PoolSampler
from src.curriculum.difficulty_updater import DifficultyUpdater
from src.training.trainer_with_kl import TrainerWithKL
from src.utils.logger import ACLLogger

class ACLExperiment:
    def __init__(self,
                 items: List[Dict],
                 student_model_factory,
                 teacher_model_factory=None,
                 total_steps:int=1000,
                 batch_size:int=8,
                 pacing_cfg:dict=None,
                 updater_cfg:dict=None,
                 trainer_cfg:dict=None,
                 logdir:str="runs/acl_default"):
        """
        student_model_factory: callable -> returns StudentModel instance
        teacher_model_factory: callable -> returns TeacherModel instance or None
        pacing_cfg: dict for AdvancedPacing initialization
        updater_cfg: dict for DifficultyUpdater
        trainer_cfg: dict for TrainerWithKL
        """
        self.raw_items = list(items)
        self.student_factory = student_model_factory
        self.teacher_factory = teacher_model_factory
        self.total_steps = int(total_steps)
        self.batch_size = int(batch_size)
        self.pacing_cfg = pacing_cfg or {}
        self.updater_cfg = updater_cfg or {}
        self.trainer_cfg = trainer_cfg or {}
        self.logger = ACLLogger(logdir)
        # placeholders
        self.dm = None
        self.sampler = None
        self.updater = None
        self.trainer = None
        self.teacher = None
        self.student = None

    def prepare(self):
        # If initial scoring not already present, compute with teacher if available
        if any('initial_difficulty' not in it for it in self.raw_items):
            if self.teacher_factory is None:
                raise RuntimeError("No teacher factory to compute initial scores")
            teacher = self.teacher_factory()
            items = compute_initial_scores(self.raw_items, model_name=teacher.model_name,
                                           task=teacher.task, batch_size=16, device=teacher.device)
        else:
            items = self.raw_items

        # dataset manager
        self.dm = DatasetManager(items)
        pacing = AdvancedPacing(n=self.dm.size(), M=self.total_steps, **self.pacing_cfg)
        # sampler
        self.sampler = PoolSampler(dataset_manager=self.dm, pacing_fn=pacing,
                                   balanced=self.pacing_cfg.get("balanced", False),
                                   seed=self.pacing_cfg.get("seed", 42))
        # updater
        self.updater = DifficultyUpdater(dataset_manager=self.dm, **self.updater_cfg)
        # teacher & student & trainer
        self.teacher = self.teacher_factory() if self.teacher_factory else None
        self.student = self.student_factory()
        trainer_cfg = dict(self.trainer_cfg)
        trainer_cfg.update({"student_model": self.student, "teacher_model": self.teacher})
        self.trainer = TrainerWithKL(**trainer_cfg)

    def run(self):
        assert self.trainer is not None, "call prepare() first"
        for step in range(1, self.total_steps + 1):
            batch_items = self.sampler.sample_batch(batch_size=self.batch_size, m_step=step)
            texts = [it['text'] for it in batch_items]
            loss, per_item_losses = self.trainer.train_step(texts)
            self.updater.observe_batch(batch_items, per_item_losses)
            updates = self.updater.maybe_update()

            debug = getattr(self.trainer, "last_debug", {"avg_ce":0.0,"avg_kl":0.0,"avg_total":loss})
            # logs
            self.logger.log_scalars({
                "loss/ce": debug["avg_ce"],
                "loss/kl": debug["avg_kl"],
                "loss/total": debug["avg_total"],
                "curriculum/pool_size": self.sampler.pacing_fn.size_for(step),
            }, step)

            # histogram snapshots occasionally
            if step % max(1, self.total_steps // 10) == 0:
                all_scores = [it['difficulty_score'] for it in self.dm.items]
                self.logger.log_histogram("difficulty/all_scores", all_scores, step)

        self.logger.close()

    def save_results(self, out_path:str):
        out = {"items": self.dm.items}
        p = Path(out_path)
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(json.dumps(out), encoding="utf-8")
