# data/get_from_mongodb.py

import logging
import os
import pandas as pd
from data.mongo_utils import get_mongo_client
from pymongo.errors import ConfigurationError, ConnectionFailure

def get_data_from_db() -> pd.DataFrame:
    MONGO_DB = os.getenv("MONGO_DB")
    SYNTHETIC_COLLECTION = os.getenv("SYNTHETIC_COLLECTION")

    client = None
    try:
        client = get_mongo_client()
        db = client[MONGO_DB]
        collection = db[SYNTHETIC_COLLECTION]

        # 필요한 필드만 가져오기
        fields = {
            "_id": 0,
            "timestamp": 1,
            "Water Level Tank (%)": 1,
            "Nutrient Tank Level (%)": 1,
            "Recycle Tank Level (%)": 1
        }
        data = list(collection.find({}, fields))

        # 데이터프레임으로 변환
        df = pd.DataFrame(data)
        df['timestamp'] = pd.to_datetime(df['timestamp'], format='%Y.%m.%d %H:%M')
        df.set_index('timestamp', inplace=True)
        logging.info("MongoDB에서 데이터를 성공적으로 가져왔습니다.")

        return df

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
        if client:
            client.close()
            logging.info("MongoDB 클라이언트를 닫았습니다.")
