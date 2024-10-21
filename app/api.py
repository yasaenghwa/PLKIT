# app/api.py

import logging
import os

import pandas as pd
from app.model_manager import ModelManager
from app.utils import preprocess_data
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()
manager = ModelManager()

class InputData(BaseModel):
    Air_Humidity_percent: float
    Solution_Temperature_C: float
    Solution_TDS_ppm: float
    Light_Intensity_percent: float
    Water_Level_Tank_percent: float
    Flow_Rate_LPM: float
    Pump_Status_off: int
    Pump_Status_on: int
    Fan_Status_off: int
    Fan_Status_on: int
    Heater_Status_off: int
    Heater_Status_on: int
    LED_Lighting_Status_off: int
    LED_Lighting_Status_on: int

@app.post("/train")
def train(model_name: str):
    try:
        from app.train_model import train_model  # 동적 임포트
        train_model(model_name)
        return {"message": f"{model_name} 모델이 성공적으로 학습되었습니다."}
    except Exception as e:
        logging.error(f"모델 학습 중 오류 발생: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict")
def predict(model_name: str, data: InputData):
    try:
        # 입력 데이터를 DataFrame으로 변환
        input_df = pd.DataFrame([data.dict()])

        # 데이터 전처리
        X, _ = preprocess_data(input_df)

        # 예측 수행
        prediction = manager.predict(model_name, X)
        return {"predicted_air_temperature_C": prediction[0]}
    except ValueError as ve:
        logging.error(f"예측 중 오류 발생: {ve}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logging.error(f"예측 중 오류 발생: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/models")
def list_models():
    models = manager.list_models()
    return {"available_models": models}
