# train_model.py

import logging
import os
from data.get_from_mongodb import get_data_from_db
from typing import Optional
from app.utils import preprocess_data
from app.model_manager import ModelManager

def setup_logging():
    log_file = os.path.join(os.path.dirname(__file__), 'train.log')
    logging.basicConfig(
        filename=log_file,
        filemode='a',
        format='%(asctime)s - %(levelname)s - %(message)s',
        level=logging.INFO,
        encoding='utf-8'
    )

def train_model(model_name: str, model_type: str, model_kwargs: Optional[dict] = None):
    try:
        # 데이터 가져오기
        df = get_data_from_db()

        # 데이터 전처리
        series_dict, scaler = preprocess_data(df)

        # 모델 매니저 초기화
        manager = ModelManager()

        # 모델 학습
        manager.train_model(model_name, series_dict, model_type, model_kwargs)
        logging.info(f"{model_name} 모델 학습 완료.")

    except Exception as e:
        logging.error(f"모델 학습 중 오류 발생: {e}")
        raise

if __name__ == "__main__":
    setup_logging()
    logging.info("모델 학습 시작")
    train_model("XGBoost", "XGBoost", {"input_chunk_length": 24, "output_chunk_length": 12, "n_epochs": 30})
    logging.info("모델 학습 종료")
