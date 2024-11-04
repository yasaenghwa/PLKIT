import os
import logging
from pymongo import MongoClient
from pymongo.errors import ConfigurationError, ConnectionFailure
from dotenv import load_dotenv

load_dotenv()

def get_mongo_client():
    MONGO_USER = os.getenv("MONGO_USER")
    MONGO_PASSWORD = os.getenv("MONGO_PASSWORD")
    MONGO_HOST = os.getenv("MONGO_HOST", "39.115.5.187")
    MONGO_PORT = int(os.getenv("MONGO_PORT", "27017"))
    MONGO_DB = os.getenv("MONGO_DB")

    uri = f"mongodb://{MONGO_USER}:{MONGO_PASSWORD}@{MONGO_HOST}:{MONGO_PORT}/{MONGO_DB}?authSource=admin"

    try:
        client = MongoClient(
            uri,
            serverSelectionTimeoutMS=5000, 
        )
        client.admin.command("ping")
        logging.info("MongoDB에 성공적으로 연결되었습니다.")
        return client
    except ConnectionFailure:
        logging.error("MongoDB 서버에 연결할 수 없습니다.")
        raise
    except ConfigurationError as e:
        logging.error(f"MongoDB 설정 오류: {e}")
        raise
    except Exception as e:
        logging.error(f"MongoDB 연결 중 오류 발생: {e}")
        raise
