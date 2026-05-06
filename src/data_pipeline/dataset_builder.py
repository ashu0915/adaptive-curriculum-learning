from torch.utils.data import Dataset
from typing import List, Dict
import torch


class TextDataset(Dataset):
    def __init__(self, items: List[Dict], tokenizer_callable, max_length: int = 512):
        self.items = items
        self.tokenizer = tokenizer_callable
        self.max_length = max_length

    def __len__(self):
        return len(self.items)

    def __getitem__(self, idx):
        it = self.items[idx]
        enc = self.tokenizer([it['text']])

        return {
            'id': it['id'],
            'input_ids': enc['input_ids'].squeeze(0),
            'attention_mask': enc['attention_mask'].squeeze(0),
            'meta': it.get('meta', {}),
            'difficulty': it.get('difficulty', None),
            'difficulty_score': it.get('difficulty_score', None),
        }


def collate_fn(batch):
    input_ids = [b['input_ids'] for b in batch]
    attention_mask = [b['attention_mask'] for b in batch]
    ids = [b['id'] for b in batch]

    input_ids = torch.nn.utils.rnn.pad_sequence(input_ids, batch_first=True, padding_value=0)
    attention_mask = torch.nn.utils.rnn.pad_sequence(attention_mask, batch_first=True, padding_value=0)

    return {
        'ids': ids,
        'input_ids': input_ids,
        'attention_mask': attention_mask,
        'metas': [b['meta'] for b in batch],
        'difficulties': [b['difficulty'] for b in batch],
        'difficulty_scores': [b['difficulty_score'] for b in batch],
    }
