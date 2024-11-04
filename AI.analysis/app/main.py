from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import os
import json
from app.model_manager import ModelManager
from app.schemas import ModelUploadResponse, PredictRequest, PredictResponse
from darts import TimeSeries
import pandas as pd
import logging
from app.config import CORS_ORIGINS

app = FastAPI(title="ML Model API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_DIR = "models"
os.makedirs(MODEL_DIR, exist_ok=True)

logging.basicConfig(
    filename='server.log',
    filemode='a',
    format='%(asctime)s - %(levelname)s - %(message)s',
    level=logging.INFO,
    encoding='utf-8'
)

model_manager = ModelManager(models_dir=MODEL_DIR)

@app.post("/upload-model/", response_model=ModelUploadResponse)
async def upload_model(
    file: UploadFile = File(...),
    model_type: str = Form(...),
    model_kwargs: Optional[str] = Form(None)
):
    logging.info(f"Received upload request: {file.filename}, type: {model_type}")

    if not file.filename.endswith(".pt"):
        logging.error(f"Invalid file extension: {file.filename}")
        raise HTTPException(status_code=400, detail="Only .pt files are allowed for TSMixer.")

    model_name, ext = os.path.splitext(file.filename)

    if model_type != "TSMixer" or ext != ".pt":
        logging.error(f"Model type and file extension mismatch: {model_type}, {ext}")
        raise HTTPException(status_code=400, detail="Model type and file extension do not match. Only TSMixer with .pt files are allowed.")

    file_path = os.path.join(MODEL_DIR, file.filename)

    try:
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        logging.info(f"File saved: {file_path}")
    except Exception as e:
        logging.error(f"File save failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save file: {e}")

    kwargs = None
    if model_kwargs:
        try:
            kwargs = json.loads(model_kwargs)
            logging.info(f"Model arguments: {kwargs}")
        except json.JSONDecodeError:
            logging.error("Invalid JSON format in model_kwargs.")
            raise HTTPException(status_code=400, detail="model_kwargs must be a valid JSON string.")

    try:
        model_manager.load_model(model_name, file_path, model_type, model_kwargs=kwargs)
        logging.info(f"Model loaded: {model_name}")
    except ValueError as ve:
        logging.error(f"Model load error: {ve}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logging.error(f"Model load failed: {e}")
        raise HTTPException(status_code=500, detail=f"Error loading model: {e}")

    return ModelUploadResponse(model_name=model_name, message="Model uploaded and loaded successfully.")

@app.get("/models/", response_model=List[str])
def list_models():
    models = model_manager.list_models()
    logging.info(f"Loaded models list: {models}")
    return models

@app.post("/predict/", response_model=PredictResponse)
def predict(request: PredictRequest):
    logging.info(f"Prediction request: {request.model_name}")

    try:
        series_predictions = {}

        if request.series:
            time_index = request.series.get("time_index")
            values = request.series.get("values")

            if not time_index or not values:
                logging.error("Missing 'time_index' or 'values' in series data.")
                raise ValueError("`time_index` and `values` are required in series data.")

            try:
                if len(time_index) == 1:
                    series = TimeSeries.from_times_and_values(pd.to_datetime(time_index), values, freq='H')
                    logging.info("Single data point, frequency set to 'H'.")
                else:
                    inferred_freq = pd.infer_freq(pd.to_datetime(time_index))
                    if inferred_freq:
                        series = TimeSeries.from_times_and_values(pd.to_datetime(time_index), values, freq=inferred_freq)
                        logging.info(f"Inferred frequency: {inferred_freq}")
                    else:
                        logging.error("Cannot infer frequency.")
                        raise ValueError("Cannot infer frequency. Please ensure consistent time intervals or provide multiple data points.")
            except Exception as e:
                logging.error(f"Time series conversion error: {e}")
                raise HTTPException(status_code=400, detail=f"Invalid `series` format: {e}")

            if not request.model_name.startswith("TSMixer"):
                logging.error("Only TSMixer models are supported.")
                raise ValueError("Only TSMixer models are supported.")

            prediction_series = model_manager.predict(request.model_name, series, n=1)
            logging.info(f"TSMixer prediction result: {prediction_series}")

            prediction = {
                "time_index": prediction_series.time_index.tolist(),
                "values": prediction_series.values().tolist()
            }
            series_predictions["series_prediction"] = prediction

        if not series_predictions:
            logging.error("No series data provided for TSMixer model prediction.")
            raise ValueError("Series data is required for TSMixer model prediction.")

        return PredictResponse(
            series_prediction=series_predictions if series_predictions else None
        )

    except ValueError as ve:
        logging.error(f"Prediction error: {ve}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logging.error(f"Error during prediction: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction error: {e}")
