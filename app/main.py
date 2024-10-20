import os
from typing import Optional

import joblib
import torch
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel

from .model_manager import ModelManager
from .utils import postprocess_output, preprocess_input

app = FastAPI(title="Multi-Model TSMixer Growth Period Prediction API")

MODEL_DIR = os.getenv("MODEL_DIR", "models")
SCALER_X_PATH = os.getenv("SCALER_X_PATH", "scalers/scaler_X.joblib")
SCALER_Y_PATH = os.getenv("SCALER_Y_PATH", "scalers/scaler_y.joblib")
SEQ_LENGTH = int(os.getenv("SEQ_LENGTH", "24"))
NUM_FEATURES = int(os.getenv("NUM_FEATURES", "10"))

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

model_manager = ModelManager(model_dir=MODEL_DIR, device=device)

try:
    scaler_X = joblib.load(SCALER_X_PATH)
    scaler_y = joblib.load(SCALER_Y_PATH)
except Exception as e:
    raise RuntimeError(f"Failed to load scalers: {e}")

class InputData(BaseModel):
    feature1: float
    feature2: float
    feature3: float
    feature4: float
    feature5: float
    feature6: float
    feature7: float
    feature8: float
    feature9: float
    feature10: float

class PredictionResponse(BaseModel):
    predicted_growth_period: float

@app.post("/predict", response_model=PredictionResponse)
def predict(data: InputData, model_name: Optional[str] = Query(None, description="사용할 모델 이름")):
    try:
        if model_name is None:
            model_name = list(model_manager.models.keys())[0]

        input_dict = data.dict()

        X_tensor = preprocess_input(
            data=input_dict,
            scaler_X=scaler_X,
            seq_length=SEQ_LENGTH,
            num_features=NUM_FEATURES
        ).to(device)

        model = model_manager.get_model(model_name)

        with torch.no_grad():
            prediction = model(X_tensor).cpu().numpy()[0]

        prediction_original = postprocess_output(prediction, scaler_y)

        return PredictionResponse(predicted_growth_period=prediction_original)

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/models", response_model=list)
def list_models():
    return list(model_manager.models.keys())

@app.get("/")
def read_root():
    return {"message": "Multi-Model TSMixer Growth Period Prediction API"}
