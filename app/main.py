# app/main.py

import sys
import os
from app.train_model import setup_logging, train_model
import logging

def main():
    setup_logging()
    logging.info("프로그램 시작")

    try:
        # 모델 학습
        train_model("TSMixer")

    except Exception as e:
        logging.error(f"메인 함수 중 오류 발생: {e}")
    finally:
        logging.info("프로그램 종료")

if __name__ == "__main__":
    main()
