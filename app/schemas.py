# app/schemas.py

from pydantic import BaseModel
from typing import List, Optional, Dict

class ModelUploadResponse(BaseModel):
    model_name: str
    message: str

class PredictRequest(BaseModel):
    model_name: str
    data: Optional[List[List[float]]] = None  # scikit-learn 모델용 입력 데이터
    series: Optional[Dict] = None            # TSMixer 모델용 시계열 데이터

class PredictResponse(BaseModel):
    prediction: Optional[List[float]] = None       # scikit-learn 모델 예측 결과
    series_prediction: Optional[Dict] = None       # TSMixer 모델 예측 결과
