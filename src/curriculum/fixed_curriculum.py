"""
Fixed curriculum scheduler.

A simple helper that yields phases according to a schedule. Each phase corresponds
to a difficulty bucket name (e.g., 'easy','medium','hard') and a number of epochs.

Example schedule:
  [ {"phase":"easy", "epochs":1}, {"phase":"medium", "epochs":2}, {"phase":"hard", "epochs":1} ]
"""

from typing import List, Dict, Iterator


class FixedCurriculum:
    def __init__(self, items: List[Dict], schedule: List[Dict]):
        """
        items: dataset items where each item has 'difficulty' label.
        schedule: list of {"phase": <bucket_name>, "epochs": <int>}
        """
        self.items = items
        self.schedule = schedule or []

    def get_phase_items(self, phase_name: str) -> List[Dict]:
        """Return items whose difficulty equals phase_name."""
        return [it for it in self.items if it.get("difficulty") == phase_name]

    def phases(self) -> Iterator[Dict]:
        """
        Iterate over (phase_name, epochs, phase_items) in schedule order.
        Yields dict: {"phase": name, "epochs": n, "items": [...]}
        """
        for entry in self.schedule:
            phase = entry.get("phase")
            epochs = int(entry.get("epochs", 1))
            yield {"phase": phase, "epochs": epochs, "items": self.get_phase_items(phase)}
