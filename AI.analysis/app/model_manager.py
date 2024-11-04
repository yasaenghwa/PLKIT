import os
import logging
from typing import Dict, Optional
from darts import TimeSeries
from app.model import TSMixerModel

class ModelManager:
    def __init__(self, models_dir: str = "models"):
        self.models_dir = models_dir
        os.makedirs(self.models_dir, exist_ok=True)
        self.available_models: Dict[str, TSMixerModel] = {}
        self.load_all_models()

    def load_all_models(self):
        for filename in os.listdir(self.models_dir):
            if filename.endswith(".pt"):
                model_name = os.path.splitext(filename)[0]
                model = self.create_model_instance(model_name)
                if model:
                    try:
                        model.load(os.path.join(self.models_dir, filename))
                        self.available_models[model_name] = model
                        logging.info(f"'{model_name}' model loaded.")
                    except Exception as e:
                        logging.error(f"Failed to load '{model_name}' model: {e}")

    def create_model_instance(self, model_name: str) -> Optional[TSMixerModel]:
        if model_name.startswith("TSMixer"):
            return TSMixerModel()
        else:
            logging.warning(f"Unknown model name: {model_name}")
            return None

    def train_model(
        self,
        model_name: str,
        series: TimeSeries,
        model_kwargs: Optional[dict] = None
    ):
        if not model_name.startswith("TSMixer"):
            raise ValueError("Only TSMixer models are supported.")

        model = TSMixerModel(**model_kwargs) if model_kwargs else TSMixerModel()
        model.train(series)
        model_filepath = os.path.join(self.models_dir, f"{model_name}.pt")
        model.save(model_filepath)
        self.available_models[model_name] = model
        logging.info(f"'{model_name}' model trained and saved.")

    def predict(
        self,
        model_name: str,
        series: TimeSeries,
        n: int = 1
    ) -> TimeSeries:
        logging.info(f"Prediction request: model name={model_name}, prediction length={n}")
        model = self.available_models.get(model_name)
        if not model:
            logging.error(f"Model not loaded: {model_name}")
            raise ValueError(f"Model not loaded: {model_name}")

        if not isinstance(model, TSMixerModel):
            logging.error("Unsupported model type.")
            raise ValueError("Unsupported model type.")

        prediction = model.predict(series, n)
        logging.info(f"Prediction result: {prediction}")
        return prediction

    def load_model(self, model_name: str, file_path: str, model_type: str, model_kwargs: Optional[dict] = None):
        if model_type == "TSMixer":
            if not model_name.startswith("TSMixer"):
                raise ValueError("Model name must start with 'TSMixer_'.")

            model = TSMixerModel(**model_kwargs) if model_kwargs else TSMixerModel()
            try:
                model.load(file_path)
                self.available_models[model_name] = model
                logging.info(f"'{model_name}' model loaded.")
            except Exception as e:
                logging.error(f"Failed to load '{model_name}' model: {e}")
                raise e
        else:
            raise ValueError(f"Unsupported model type: {model_type}")

    def list_models(self) -> list:
        return list(self.available_models.keys())
