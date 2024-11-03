import logging
import os

import pandas as pd
from data.mongo_utils import get_mongo_client


def load_data_from_csv(file_path: str = "Synthetic_data.csv") -> pd.DataFrame:
    try:
        df = pd.read_csv(file_path)
        logging.info(f"CSV 파일 '{file_path}'을 성공적으로 로드했습니다.")
        return df
    except FileNotFoundError:
        logging.error(f"CSV 파일 '{file_path}'을 찾을 수 없습니다.")
        raise
    except Exception as e:
        logging.error(f"CSV 파일 로드 중 오류 발생: {e}")
        raise

def upload_csv_to_mongodb(file_path: str = "Synthetic_data.csv") -> None:
    client = None
    try:
        df = load_data_from_csv(file_path)
        data_dict = df.to_dict("records")

        client = get_mongo_client()
        db = client[os.getenv("MONGO_DB")]
        collection = db[os.getenv("SYNTHETIC_COLLECTION")]

        if data_dict:
            collection.insert_many(data_dict)
            logging.info("CSV 데이터를 MongoDB에 성공적으로 업로드했습니다.")
        else:
            logging.warning("CSV 파일이 비어있어 업로드할 데이터가 없습니다.")

    except Exception as e:
        logging.error(f"CSV 데이터를 MongoDB에 업로드하는 중 오류 발생: {e}")
        raise
    finally:
        if client:
            client.close()
            logging.info("MongoDB 클라이언트를 닫았습니다.")
