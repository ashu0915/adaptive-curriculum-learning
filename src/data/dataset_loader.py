import json
from pathlib import Path


class DatasetLoader:
    """
    Loads JSONL datasets used by the ACL pipeline.

    Expected format per line:
    {
        "text": "...",
        "label": 0
    }
    """

    @staticmethod
    def load_jsonl(path):
        path = Path(path)

        if not path.exists():
            raise FileNotFoundError(f"Dataset not found: {path}")

        items = []

        with open(path, "r", encoding="utf-8") as f:
            for idx, line in enumerate(f):
                obj = json.loads(line)

                if "text" not in obj:
                    raise ValueError("Dataset item missing 'text' field")

                # Ensure item has an 'id' field; generate one if missing
                if "id" not in obj:
                    obj["id"] = str(idx)

                items.append(obj)

        return items