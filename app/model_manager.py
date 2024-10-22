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
from typing import Dict, Optional
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
                    try:
                        model.load(os.path.join(self.models_dir, filename))
                        self.available_models[model_name] = model
                        logging.info(f"'{model_name}' 모델을 로드했습니다.")
                    except Exception as e:
                        logging.error(f"'{model_name}' 모델 로드 실패: {e}")

    def create_model_instance(self, model_name: str, ext: str) -> Optional[BaseModel]:
        """
        파일 확장자와 모델 이름을 기반으로 적절한 모델 인스턴스를 생성합니다.
        """
        if ext == ".joblib":
            if model_name == "RandomForest":
                return RandomForestModel()
            elif model_name == "LinearRegression":
                return LinearRegressionModel()
            elif model_name == "XGBoost":
                return XGBoostModel()
            else:
                logging.warning(f"알 수 없는 모델 이름 (joblib): {model_name}")
                return None
        elif ext == ".pt":
            if model_name.startswith("TSMixer"):
                return TSMixerModel()
            else:
                logging.warning(f"알 수 없는 모델 이름 (pt): {model_name}")
                return None
        else:
            logging.warning(f"지원되지 않는 파일 확장자: {ext}")
            return None

    def train_model(self, model_name: str, series_dict: dict, model_type: str, model_kwargs: Optional[dict] = None):
        """
        주어진 모델 유형에 따라 모델을 학습하고 저장합니다.
        """
        if model_type == "TSMixer":
            # 각 타겟별로 TSMixer 모델을 학습하고 저장
            for target, series in series_dict.items():
                specific_model_name = f"TSMixer_{target}"
                model = TSMixerModel(**model_kwargs) if model_kwargs else TSMixerModel()
                model.train(series)
                model_filepath = os.path.join(self.models_dir, f"{specific_model_name}.pt")
                model.save(model_filepath)
                self.available_models[specific_model_name] = model
                logging.info(f"'{specific_model_name}' 모델을 학습하고 저장했습니다.")
        else:
            # 다른 모델들은 예를 들어 각 타겟별로 학습할 수 있습니다.
            # 여기서는 첫 번째 타겟에 대해 학습
            first_target = list(series_dict.keys())[0]
            series = series_dict[first_target]
            model = self.available_models.get(model_name)
            if not model:
                model = self.create_model_instance(model_name, ".joblib")
                if not model:
                    raise ValueError(f"지원되지 않는 모델 이름입니다: {model_name}")
                self.available_models[model_name] = model

            model.train(series)
            model_filepath = os.path.join(self.models_dir, f"{model_name}.joblib")
            model.save(model_filepath)
            logging.info(f"'{model_name}' 모델을 학습하고 저장했습니다.")

    def predict(self, model_name: str, input_data: Optional[dict] = None, series: Optional[TimeSeries] = None, n: int = 1):
        """
        모델을 사용하여 예측을 수행합니다.
        """
        model = self.available_models.get(model_name)
        if not model:
            raise ValueError(f"모델이 로드되지 않았습니다: {model_name}")

        if isinstance(model, (RandomForestModel, LinearRegressionModel, XGBoostModel)):
            if input_data is None:
                raise ValueError("입력 데이터가 필요합니다.")
            return model.predict(input_data)
        elif isinstance(model, TSMixerModel):
            if series is None:
                raise ValueError("시계열 데이터가 필요합니다.")
            return model.predict(series, n)
        else:
            raise ValueError("지원되지 않는 모델 유형입니다.")

    def list_models(self):
        return list(self.available_models.keys())
