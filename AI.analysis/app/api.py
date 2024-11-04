import logging
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, List
import pandas as pd
from app.model_manager import ModelManager
from darts import TimeSeries

logging.basicConfig(level=logging.INFO)
logging.info("API server started.")

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
    try:
        from app.train_model import train_model
        train_model(model_name)
        return {"message": f"{model_name} model successfully trained."}
    except Exception as e:
        logging.error(f"Error during model training: {e}")
        raise HTTPException(status_code=500, detail=str(e))

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

            series = TimeSeries.from_times_and_values(pd.to_datetime(time_index), values)
            logging.info(f"Time series data: {request.series}")

            if not request.model_name.startswith("TSMixer"):
                logging.error("Only TSMixer models are supported.")
                raise ValueError("Only TSMixer models are supported.")

            prediction_series = manager.predict(request.model_name, series, n=1)
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
            predictions={},
            series_prediction=series_predictions if series_predictions else None
        )

    except ValueError as ve:
        logging.error(f"Error during prediction: {ve}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logging.error(f"Error during prediction: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction error: {e}")

@app.get("/models")
def list_models():
    models = manager.list_models()
    return {"available_models": models}
