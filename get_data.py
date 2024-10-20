import os
from typing import Dict

import pandas as pd
from pymongo import MongoClient
from pymongo.errors import ConfigurationError, ConnectionFailure


def load_data_from_csv() -> pd.DataFrame:
    file_path = "./PLKIT-AI.analysis/Synthetic_data.csv"
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"No such file or directory: '{file_path}'")
    df = pd.read_csv(file_path)
    return df


def upload_csv_to_mongodb():
    df = load_data_from_csv()

    data_dict = df.to_dict("records")

    client = MongoClient("mongodb://39.115.5.187:27017/")
    db = client["Yasaengwha"]
    collection = db["Synthetic_data"]

    collection.insert_many(data_dict)
    print("Data uploaded to MongoDB successfully.")


def get_data_from_db() -> pd.DataFrame:
    MONGO_USER = os.getenv("MONGO_USER", "your_username")
    MONGO_PASSWORD = os.getenv("MONGO_PASSWORD", "your_password")
    MONGO_HOST = "39.115.5.187"
    MONGO_PORT = 27017
    MONGO_DB = "your_database_name"
    SENSORS_COLLECTION = "sensors"
    CONTROLS_COLLECTION = "controls"

    try:
        client = MongoClient(
            host=MONGO_HOST,
            port=MONGO_PORT,
            username=MONGO_USER,
            password=MONGO_PASSWORD,
            serverSelectionTimeoutMS=5000,
        )

        client.admin.command("ping")
        print("MongoDB에 성공적으로 연결되었습니다.")

        db = client[MONGO_DB]
        sensors_collection = db[SENSORS_COLLECTION]
        controls_collection = db[CONTROLS_COLLECTION]

        sensors_data = list(sensors_collection.find({}, {"_id": 0, "value": 1}))
        controls_data = list(
            controls_collection.find({}, {"_id": 0, "status": 1, "value": 1})
        )

        sensors_df = pd.json_normalize(sensors_data).filter(regex="value")
        controls_df = pd.json_normalize(controls_data).filter(regex="status|value")

        combined_df = pd.concat([sensors_df, controls_df], axis=1)

        return combined_df

    except ConnectionFailure:
        print("MongoDB 서버에 연결할 수 없습니다.")
        raise
    except ConfigurationError as e:
        print(f"MongoDB 설정 오류: {e}")
        raise
    except Exception as e:
        print(f"데이터 가져오기 중 오류 발생: {e}")
        raise
    finally:
        # 클라이언트 닫기
        client.close()
        print("MongoDB 클라이언트를 닫았습니다.")


def main():
    df = get_data_from_db()
    print(df)
