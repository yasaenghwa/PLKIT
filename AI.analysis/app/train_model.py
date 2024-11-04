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
        df = get_data_from_db()

        series_dict, _ = preprocess_data(df)

        manager = ModelManager()

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
