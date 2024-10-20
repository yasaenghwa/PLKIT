import os
from typing import Dict

import torch
import torch.nn as nn

from .model import LSTMModel, TSMixer


class ModelManager:
    def __init__(self, model_dir: str, device: torch.device):
        self.model_dir = model_dir
        self.device = device
        self.models: Dict[str, nn.Module] = {}
        self.load_all_models()

    def load_model(self, model_name: str, model_type: str, config: Dict):
        model_path = os.path.join(self.model_dir, f"{model_name}.pth")
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file {model_path} does not exist.")

        if model_type == "LSTM":
            model = LSTMModel(
                input_size=config['input_size'],
                hidden_size=config.get('hidden_size', 64),
                num_layers=config.get('num_layers', 2)
            )
        elif model_type == "TSMixer":
            model = TSMixer(
                num_features=config['num_features'],
                mixer_blocks=config.get('mixer_blocks', 2),
                token_dim=config.get('token_dim', 256),
                channel_dim=config.get('channel_dim', 256),
                seq_length=config.get('seq_length', 24)
            )
        else:
            raise ValueError(f"Unsupported model type: {model_type}")

        model.load_state_dict(torch.load(model_path, map_location=self.device))
        model.to(self.device)
        model.eval()
        self.models[model_name] = model
        print(f"Loaded {model_type} model: {model_name}")

    def load_all_models(self):
        for file in os.listdir(self.model_dir):
            if file.endswith(".pth"):
                parts = file[:-4].split("_")
                if len(parts) < 2:
                    print(f"Skipping unrecognized model file: {file}")
                    continue
                model_name = "_".join(parts[:-1])
                model_type = parts[-1]
                if model_type == "LSTM":
                    config = {
                        'input_size': 10,
                        'hidden_size': 64,
                        'num_layers': 2
                    }
                elif model_type == "TSMixer":
                    config = {
                        'num_features': 10,
                        'mixer_blocks': 2,
                        'token_dim': 256,
                        'channel_dim': 256,
                        'seq_length': 24
                    }
                else:
                    print(f"Unsupported model type in file: {file}")
                    continue

                try:
                    self.load_model(model_name, model_type, config)
                except Exception as e:
                    print(f"Failed to load model {model_name}: {e}")

    def get_model(self, model_name: str) -> nn.Module:
        if model_name not in self.models:
            raise ValueError(f"Model {model_name} is not loaded.")
        return self.models[model_name]
