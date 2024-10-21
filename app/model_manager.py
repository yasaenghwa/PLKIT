# app/model_manager.py

import os
import logging
from app.model import (
    RandomForestModel,
    LinearRegressionModel,
    XGBoostModel,
    TSMixerModel,
    BaseModel
)
from typing import Dict
from darts import TimeSeries

class ModelManager:
    def __init__(self, models_dir: str = "models"):
        self.models_dir = models_dir
        os.makedirs(self.models_dir, exist_ok=True)
        self.available_models: Dict[str, BaseModel] = {}
        self.load_all_models()

    def load_all_models(self):
        for filename in os.listdir(self.models_dir):
            if filename.endswith(".joblib") or filename.endswith(".pt"):
                model_name, ext = os.path.splitext(filename)
                model = self.create_model_instance(model_name, ext)
                if model:
                    model.load(os.path.join(self.models_dir, filename))
                    self.available_models[model_name] = model
                    logging.info(f"{model_name} 모델을 로드했습니다.")

    def create_model_instance(self, model_name: str, ext: str = ".joblib") -> BaseModel:
        if model_name == "RandomForest":
            return RandomForestModel()
        elif model_name == "LinearRegression":
            return LinearRegressionModel()
        elif model_name == "XGBoost":
            return XGBoostModel()
        elif model_name.startswith("TSMixer"):
            return TSMixerModel()
        else:
            logging.warning(f"알 수 없는 모델 이름: {model_name}")
            return None

    def train_model(self, model_name: str, series_dict: dict):
        if model_name == "TSMixer":
            # 각 타겟별로 TSMixer 모델을 학습하고 저장
            for target, series in series_dict.items():
                specific_model_name = f"TSMixer_{target}"
                model = TSMixerModel()
                model.train(series)
                model_filepath = os.path.join(self.models_dir, f"{specific_model_name}.pt")
                model.save(model_filepath)
                self.available_models[specific_model_name] = model
                logging.info(f"{specific_model_name} 모델을 학습하고 저장했습니다.")
        else:
            # 다른 모델들은 예를 들어 각 타겟별로 학습할 수 있습니다.
            # 여기서는 첫 번째 타겟에 대해 학습
            first_target = list(series_dict.keys())[0]
            series = series_dict[first_target]
            model = self.available_models.get(model_name)
            if not model:
                model = self.create_model_instance(model_name)
                if not model:
                    raise ValueError(f"모델 이름이 올바르지 않습니다: {model_name}")
                self.available_models[model_name] = model

            model.train(series)
            if isinstance(model, TSMixerModel):
                model_filepath = os.path.join(self.models_dir, f"{model_name}.pt")
            else:
                model_filepath = os.path.join(self.models_dir, f"{model_name}.joblib")
            model.save(model_filepath)
            logging.info(f"{model_name} 모델을 학습하고 저장했습니다.")

    def predict(self, model_name: str, series: TimeSeries, n: int) -> TimeSeries:
        model = self.available_models.get(model_name)
        if not model:
            raise ValueError(f"모델이 로드되지 않았습니다: {model_name}")
        return model.predict(series, n)

    def list_models(self):
        return list(self.available_models.keys())
