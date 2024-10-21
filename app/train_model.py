# app/train_model.py

import logging
import os

import pandas as pd
from app.model_manager import ModelManager
from app.utils import preprocess_data
from data.get_from_mongodb import get_data_from_db


def setup_logging():
    log_file = os.path.join(os.path.dirname(__file__), '.', 'train.log')
    logging.basicConfig(
        filename=log_file,
        filemode='a',
        format='%(asctime)s - %(levelname)s - %(message)s',
        level=logging.INFO,
        encoding='utf-8'
    )

def train_model(model_name: str):
    try:
        # 데이터 가져오기
        df = get_data_from_db()

        # 데이터 전처리
        X, y = preprocess_data(df)

        # 모델 매니저 초기화
        manager = ModelManager()

        # 모델 학습
        manager.train_model(model_name, X, y)
        logging.info(f"{model_name} 모델 학습 완료.")

    except Exception as e:
        logging.error(f"모델 학습 중 오류 발생: {e}")
        raise

if __name__ == "__main__":
    setup_logging()
    logging.info("모델 학습 시작")
    # 원하는 모델 이름으로 변경: "RandomForest", "LinearRegression", "XGBoost", "LSTM", "TSMixer"
    train_model("LSTM")
    logging.info("모델 학습 종료")
