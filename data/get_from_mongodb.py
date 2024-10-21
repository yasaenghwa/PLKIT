# get_from_mongodb.py

import logging
import os

import pandas as pd
from data.mongo_utils import get_mongo_client
from pymongo.errors import ConfigurationError, ConnectionFailure


def get_data_from_db() -> pd.DataFrame:
    MONGO_DB = os.getenv("MONGO_DB")
    SENSORS_COLLECTION = os.getenv("SENSORS_COLLECTION")
    CONTROLS_COLLECTION = os.getenv("CONTROLS_COLLECTION")

    try:
        client = get_mongo_client()
        db = client[MONGO_DB]
        sensors_collection = db[SENSORS_COLLECTION]
        controls_collection = db[CONTROLS_COLLECTION]

        sensors_data = list(sensors_collection.find({}, {"_id": 0, "value": 1}))
        controls_data = list(controls_collection.find({}, {"_id": 0, "status": 1, "value": 1}))

        sensors_df = pd.json_normalize(sensors_data).filter(regex="value")
        controls_df = pd.json_normalize(controls_data).filter(regex="status|value")

        combined_df = pd.concat([sensors_df, controls_df], axis=1)
        logging.info("MongoDB에서 데이터를 성공적으로 가져왔습니다.")

        return combined_df

    except ConnectionFailure:
        logging.error("MongoDB 서버에 연결할 수 없습니다.")
        raise
    except ConfigurationError as e:
        logging.error(f"MongoDB 설정 오류: {e}")
        raise
    except Exception as e:
        logging.error(f"데이터 가져오기 중 오류 발생: {e}")
        raise
    finally:
        client.close()
        logging.info("MongoDB 클라이언트를 닫았습니다.")
