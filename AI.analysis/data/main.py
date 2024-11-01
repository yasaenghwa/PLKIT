# main.py

import logging

from get_from_mongodb import get_data_from_db
from upload_to_mongodb import upload_csv_to_mongodb


def setup_logging():
    logging.basicConfig(
        filename='./data/mongodb.log',
        filemode='a',
        format='%(asctime)s - %(levelname)s - %(message)s',
        level=logging.INFO,
        encoding='utf-8'
    )

def main():
    setup_logging()
    logging.info("프로그램 시작")

    try:
        # 데이터 가져오기
        df = get_data_from_db()

    except Exception as e:
        logging.error(f"메인 함수 중 오류 발생: {e}")
    finally:
        logging.info("프로그램 종료")

if __name__ == "__main__":
    main()
