# app/api.py

import logging
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, List
import pandas as pd
from app.model_manager import ModelManager
from app.utils import preprocess_data
from darts import TimeSeries

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logging.info("API 서버 시작됨.")

app = FastAPI(title="TSMixer Model API")
manager = ModelManager()

class PredictRequest(BaseModel):
    model_name: str
    series: Optional[Dict[str, List]] = None

class PredictResponse(BaseModel):
    predictions: Dict[str, float]
    series_prediction: Optional[Dict[str, Dict[str, List]]] = None

@app.post("/train")
def train(model_name: str):
    """
    모델을 학습하고 저장하는 엔드포인트.
    """
    try:
        from app.train_model import train_model  # 동적 임포트
        train_model(model_name)
        return {"message": f"{model_name} 모델이 성공적으로 학습되었습니다."}
    except Exception as e:
        logging.error(f"모델 학습 중 오류 발생: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/", response_model=PredictResponse)
def predict(request: PredictRequest):
    """
    모델을 사용하여 예측을 수행하는 엔드포인트.
    - `model_name`: 사용할 모델의 이름 (TSMixer_타겟명)
    - `series`: TSMixer 모델용 시계열 데이터
    """
    logging.info(f"예측 요청: {request.model_name}")

    try:
        series_predictions = {}

        # TSMixer 모델 예측 처리
        if request.series:
            # 시계열 데이터 처리
            time_index = request.series.get("time_index")
            values = request.series.get("values")

            if not time_index or not values:
                logging.error("시리즈 데이터에 'time_index' 또는 'values'가 없습니다.")
                raise ValueError("`time_index`와 `values`는 시리즈 데이터에 필수적입니다.")

            # 시리즈 데이터 변환
            series = TimeSeries.from_times_and_values(pd.to_datetime(time_index), values)
            logging.info(f"시계열 데이터: {request.series}")

            # 모델 이름이 TSMixer로 시작하는지 확인
            if not request.model_name.startswith("TSMixer"):
                logging.error("TSMixer 모델만 지원됩니다.")
                raise ValueError("TSMixer 모델만 지원됩니다.")

            # 예측 수행
            prediction_series = manager.predict(request.model_name, series, n=1)
            logging.info(f"TSMixer 예측 결과: {prediction_series}")

            # 예측 결과 변환
            prediction = {
                "time_index": prediction_series.time_index.tolist(),
                "values": prediction_series.values().tolist()
            }
            series_predictions["series_prediction"] = prediction

        if not series_predictions:
            logging.error("TSMixer 모델 예측을 위한 시리즈 데이터가 제공되지 않았습니다.")
            raise ValueError("TSMixer 모델 예측을 위한 시리즈 데이터가 제공되지 않았습니다.")

        return PredictResponse(
            predictions={},  # TSMixer 모델만 사용하므로 빈 딕셔너리 유지
            series_prediction=series_predictions if series_predictions else None
        )

    except ValueError as ve:
        logging.error(f"예측 중 오류 발생: {ve}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logging.error(f"예측 중 오류 발생: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction error: {e}")

@app.get("/models")
def list_models():
    """
    사용 가능한 모든 모델 목록을 반환하는 엔드포인트.
    """
    models = manager.list_models()
    return {"available_models": models}
