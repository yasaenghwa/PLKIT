# app/main.py

import os
import sys

# 현재 파일의 디렉토리 (app/)를 기준으로 상위 디렉토리 (your_project/)를 추가
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
sys.path.append(project_root)

import logging

import uvicorn
from app.train_model import setup_logging, train_model


def main():
    setup_logging()
    logging.info("프로그램 시작")

    try:
        # CSV 업로드
        from data.get_from_mongodb import get_data_from_db

        # 데이터 가져오기
        df = get_data_from_db()
        logging.info(f"데이터프레임 내용:\n{df.head()}")

        # 모델 학습 (필요 시)
        train_model("RandomForest")  # FastAPI API를 통해 학습할 수도 있습니다.

        # FastAPI 서버 실행
        uvicorn.run("app.api:app", host="0.0.0.0", port=8000, reload=True)

    except Exception as e:
        logging.error(f"메인 함수 중 오류 발생: {e}")
    finally:
        logging.info("프로그램 종료")

if __name__ == "__main__":
    main()
