import re
from typing import List, Dict


def basic_clean(text: str) -> str:
    text = text.replace('\t', ' ').replace('\r', ' ')
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def preprocess_items(items: List[Dict]) -> List[Dict]:
    for it in items:
        it['text'] = basic_clean(it.get('text', ''))
    return items
