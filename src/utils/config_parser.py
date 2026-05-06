"""
src/utils/config_parser.py

Small YAML config loader with optional schema validation helpers.
Uses pyyaml (safe_load). Keeps values immutable (returns dict).
"""

from pathlib import Path
import yaml
from typing import Any, Dict


def load_yaml_config(path: str) -> Dict[str, Any]:
    """
    Load YAML config from `path` and return a dict.
    Raises FileNotFoundError or yaml.YAMLError on failure.
    """
    p = Path(path)
    if not p.exists():
        raise FileNotFoundError(f"Config file not found: {path}")
    with p.open("r", encoding="utf-8") as f:
        data = yaml.safe_load(f)
    if data is None:
        data = {}
    if not isinstance(data, dict):
        raise ValueError(f"Config at {path} must be a YAML mapping (dict) at top-level.")
    return data


def merge_configs(*configs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Merge multiple config dicts. Later dicts override earlier ones.
    Performs shallow merge (sufficient for most training configs).
    """
    out: Dict[str, Any] = {}
    for c in configs:
        if not isinstance(c, dict):
            continue
        out.update(c)
    return out


def ensure_keys(cfg: Dict[str, Any], required_keys: Dict[str, Any]):
    """
    Ensure `cfg` contains required keys. `required_keys` is a mapping
    key -> default_value. If a required key is missing, it will be set
    to the provided default. Returns the updated cfg (mutates in-place).
    """
    for k, default in required_keys.items():
        if k not in cfg:
            cfg[k] = default
    return cfg


if __name__ == "__main__":
    # tiny self-test for local usage
    import json
    try:
        cfg = load_yaml_config("config/training_config.yaml")
        print("Loaded config keys:", list(cfg.keys()))
        merged = merge_configs(cfg, {"extra": 123})
        print("Merged preview:", json.dumps(merged, indent=2))
    except Exception as e:
        print("Config parser self-test failed:", e)
