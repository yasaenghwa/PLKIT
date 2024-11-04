from pydantic import BaseModel
from typing import Dict, List, Optional

class ModelUploadResponse(BaseModel):
    model_name: str
    message: str

class PredictRequest(BaseModel):
    model_name: str
    series: Optional[Dict[str, List]] = None
    freq: Optional[str] = None

class PredictResponse(BaseModel):
    series_prediction: Optional[Dict[str, Dict[str, List]]] = None
