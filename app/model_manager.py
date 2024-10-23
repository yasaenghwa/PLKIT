# app/model_manager.py

import os
import logging
from typing import Dict, Optional
from darts import TimeSeries
from app.model import TSMixerModel  # TSMixerModel만 임포트
from app.utils import preprocess_data

class ModelManager:
    def __init__(self, models_dir: str = "models"):
        """
        ModelManager 초기화. 모델 디렉토리를 설정하고 모든 TSMixer 모델을 로드합니다.
        """
        self.models_dir = models_dir
        os.makedirs(self.models_dir, exist_ok=True)
        self.available_models: Dict[str, TSMixerModel] = {}
        self.load_all_models()

    def load_all_models(self):
        """
        모델 디렉토리에 있는 모든 TSMixer 모델(.pt 파일)을 로드합니다.
        """
        for filename in os.listdir(self.models_dir):
            if filename.endswith(".pt"):
                model_name = os.path.splitext(filename)[0]
                model = self.create_model_instance(model_name)
                if model:
                    try:
                        model.load(os.path.join(self.models_dir, filename))
                        self.available_models[model_name] = model
                        logging.info(f"'{model_name}' 모델을 로드했습니다.")
                    except Exception as e:
                        logging.error(f"'{model_name}' 모델 로드 실패: {e}")

    def create_model_instance(self, model_name: str) -> Optional[TSMixerModel]:
        """
        모델 이름을 기반으로 TSMixerModel 인스턴스를 생성합니다.
        """
        if model_name.startswith("TSMixer"):
            return TSMixerModel()
        else:
            logging.warning(f"알 수 없는 모델 이름: {model_name}")
            return None

    def train_model(
        self,
        model_name: str,
        series: TimeSeries,
        model_kwargs: Optional[dict] = None
    ):
        """
        TSMixer 모델을 학습하고 저장합니다.
        """
        if not model_name.startswith("TSMixer"):
            raise ValueError("TSMixer 모델만 지원됩니다.")

        model = TSMixerModel(**model_kwargs) if model_kwargs else TSMixerModel()
        model.train(series)
        model_filepath = os.path.join(self.models_dir, f"{model_name}.pt")
        model.save(model_filepath)
        self.available_models[model_name] = model
        logging.info(f"'{model_name}' 모델을 학습하고 저장했습니다.")

    def predict(
        self,
        model_name: str,
        series: TimeSeries,
        n: int = 1
    ) -> TimeSeries:
        """
        지정된 TSMixer 모델을 사용하여 예측을 수행합니다.
        """
        logging.info(f"예측 요청: 모델 이름={model_name}, 예측 길이={n}")
        model = self.available_models.get(model_name)
        if not model:
            logging.error(f"모델이 로드되지 않았습니다: {model_name}")
            raise ValueError(f"모델이 로드되지 않았습니다: {model_name}")

        if not isinstance(model, TSMixerModel):
            logging.error("지원되지 않는 모델 유형입니다.")
            raise ValueError("지원되지 않는 모델 유형입니다.")

        prediction = model.predict(series, n)
        logging.info(f"예측 결과: {prediction}")
        return prediction

    def load_model(self, model_name: str, file_path: str, model_type: str, model_kwargs: Optional[dict] = None):
        """
        개별 모델을 로드합니다.
        """
        if model_type == "TSMixer":
            if not model_name.startswith("TSMixer"):
                raise ValueError("모델 이름은 'TSMixer_'로 시작해야 합니다.")

            model = TSMixerModel(**model_kwargs) if model_kwargs else TSMixerModel()
            try:
                model.load(file_path)
                self.available_models[model_name] = model
                logging.info(f"'{model_name}' 모델을 로드했습니다.")
            except Exception as e:
                logging.error(f"'{model_name}' 모델 로드 실패: {e}")
                raise e
        else:
            raise ValueError(f"지원되지 않는 모델 유형입니다: {model_type}")

    def list_models(self) -> list:
        """
        로드된 모든 모델의 이름을 반환합니다.
        """
        return list(self.available_models.keys())
