# app/model_manager.py

import logging
import os
from typing import Dict

from app.model import (
    BaseModel,
    LinearRegressionModel,
    LSTMModel,
    RandomForestModel,
    TSMixerModel,
    XGBoostModel,
)


class ModelManager:
    def __init__(self, models_dir: str = "models"):
        self.models_dir = models_dir
        os.makedirs(self.models_dir, exist_ok=True)
        self.available_models: Dict[str, BaseModel] = {}
        self.load_all_models()

    def load_all_models(self):
        for filename in os.listdir(self.models_dir):
            if filename.endswith(".joblib") or filename.endswith(".pth"):
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
        elif model_name == "LSTM":
            # LSTM 모델 초기화 시 필요한 매개변수를 지정
            input_size = 10  # 예시 값, 실제 데이터에 맞게 조정
            hidden_size = 50
            num_layers = 2
            output_size = 1
            return LSTMModel(input_size, hidden_size, num_layers, output_size)
        elif model_name == "TSMixer":
            return TSMixerModel()
        else:
            logging.warning(f"알 수 없는 모델 이름: {model_name}")
            return None

    def train_model(self, model_name: str, X, y):
        model = self.available_models.get(model_name)
        if not model:
            model = self.create_model_instance(model_name)
            if not model:
                raise ValueError(f"모델 이름이 올바르지 않습니다: {model_name}")
            self.available_models[model_name] = model

        model.train(X, y)
        # 모델 유형에 따라 저장 방식 다름
        if isinstance(model, LSTMModel):
            model_filepath = os.path.join(self.models_dir, f"{model_name}.pth")
        else:
            model_filepath = os.path.join(self.models_dir, f"{model_name}.joblib")

        model.save(model_filepath)
        logging.info(f"{model_name} 모델을 학습하고 저장했습니다.")

    def predict(self, model_name: str, X):
        model = self.available_models.get(model_name)
        if not model:
            raise ValueError(f"모델이 로드되지 않았습니다: {model_name}")
        return model.predict(X)

    def list_models(self):
        return list(self.available_models.keys())
