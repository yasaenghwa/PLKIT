# app/main.py

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.responses import JSONResponse
from typing import List, Optional, Dict
import os
import json
from app.model_manager import ModelManager
from app.schemas import (
    ModelUploadResponse,
    PredictRequest,
    PredictResponse
)
from darts import TimeSeries
import pandas as pd
import logging

app = FastAPI(title="ML Model API")

# 모델이 저장될 디렉토리
MODEL_DIR = "models"
os.makedirs(MODEL_DIR, exist_ok=True)

# 로깅 설정
logging.basicConfig(
    filename='server.log',
    filemode='a',
    format='%(asctime)s - %(levelname)s - %(message)s',
    level=logging.INFO,
    encoding='utf-8'
)

# 모델 관리자 인스턴스 생성
model_manager = ModelManager(models_dir=MODEL_DIR)

@app.post("/upload-model/", response_model=ModelUploadResponse)
async def upload_model(
    file: UploadFile = File(...),
    model_type: str = Form(...),
    model_kwargs: Optional[str] = Form(None)
):
    """
    모델을 업로드하고 로드합니다.
    - `model_type`: 모델 유형 (TSMixer)
    - `model_kwargs`: TSMixer 모델에 필요한 추가 인자 (JSON 형식 문자열)
    """

    logging.info(f"Received upload request: {file.filename}, type: {model_type}")

    # 파일 이름 검증
    if not file.filename.endswith(".pt"):
        logging.error(f"업로드된 파일의 확장자가 유효하지 않습니다: {file.filename}")
        raise HTTPException(status_code=400, detail="Only .pt files are allowed for TSMixer.")

    model_name, ext = os.path.splitext(file.filename)

    # 모델 유형과 파일 확장자 일치 확인
    if model_type != "TSMixer" or ext != ".pt":
        logging.error(f"모델 유형과 파일 확장자가 일치하지 않습니다: {model_type}, {ext}")
        raise HTTPException(status_code=400, detail="Model type and file extension do not match. Only TSMixer with .pt files are allowed.")

    file_path = os.path.join(MODEL_DIR, file.filename)

    # 파일 저장
    try:
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        logging.info(f"파일 저장 완료: {file_path}")
    except Exception as e:
        logging.error(f"파일 저장 실패: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save file: {e}")

    # 모델 인자 처리
    kwargs = None
    if model_kwargs:
        try:
            kwargs = json.loads(model_kwargs)
            logging.info(f"모델 인자: {kwargs}")
        except json.JSONDecodeError:
            logging.error("model_kwargs가 유효한 JSON 형식이 아닙니다.")
            raise HTTPException(status_code=400, detail="model_kwargs must be a valid JSON string.")

    # 모델 로드
    try:
        model_manager.load_model(model_name, file_path, model_type, model_kwargs=kwargs)
        logging.info(f"모델 로드 완료: {model_name}")
    except ValueError as ve:
        logging.error(f"모델 로드 오류: {ve}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logging.error(f"모델 로드 실패: {e}")
        raise HTTPException(status_code=500, detail=f"Error loading model: {e}")

    return ModelUploadResponse(model_name=model_name, message="Model uploaded and loaded successfully.")

@app.get("/models/", response_model=List[str])
def list_models():
    """
    로드된 모든 모델의 이름을 반환합니다.
    """
    models = model_manager.list_models()
    logging.info(f"로드된 모델 목록 조회: {models}")
    return models

@app.post("/predict/", response_model=PredictResponse)
def predict(request: PredictRequest):
    """
    모델을 사용하여 예측을 수행합니다.
    - `model_name`: 사용할 모델의 이름 (TSMixer_타겟명)
    - `series`: TSMixer 모델용 시계열 데이터
    - `freq`: 시계열 데이터의 빈도 (예: 'H' for hourly, 'D' for daily)
    """
    logging.info(f"예측 요청: {request.model_name}")

    try:
        series_predictions = {}

        # TSMixer 모델 예측 처리
        if request.series:
            # 시계열 데이터 처리
            time_index = request.series.get("time_index")
            values = request.series.get("values")
            freq = request.freq  # 빈도 추가

            if not time_index or not values:
                logging.error("시리즈 데이터에 'time_index' 또는 'values'가 없습니다.")
                raise ValueError("`time_index`와 `values`는 시리즈 데이터에 필수적입니다.")

            # 시리즈 데이터 변환
            try:
                if freq:
                    series = TimeSeries.from_times_and_values(pd.to_datetime(time_index), values, freq=freq)
                else:
                    # 빈도가 제공되지 않은 경우, 최소한의 빈도 설정 (예: 'H' for hourly)
                    if len(time_index) > 1:
                        inferred_freq = pd.infer_freq(pd.to_datetime(time_index))
                        if inferred_freq:
                            series = TimeSeries.from_times_and_values(pd.to_datetime(time_index), values, freq=inferred_freq)
                        else:
                            logging.error("시계열 데이터의 빈도를 추론할 수 없습니다.")
                            raise ValueError("Cannot infer frequency. Please provide `freq`.")
                    else:
                        logging.error("단일 데이터 포인트로는 빈도를 추론할 수 없습니다. `freq`를 제공해주세요.")
                        raise ValueError("Frequency (`freq`) must be provided for single data points.")
                logging.info(f"시계열 데이터: {request.series}, 빈도: {freq}")
            except Exception as e:
                logging.error(f"시계열 데이터 변환 오류: {e}")
                raise HTTPException(status_code=400, detail=f"Invalid `series` format: {e}")

            # 모델 이름이 TSMixer로 시작하는지 확인
            if not request.model_name.startswith("TSMixer"):
                logging.error("TSMixer 모델만 지원됩니다.")
                raise ValueError("TSMixer 모델만 지원됩니다.")

            # 예측 수행
            prediction_series = model_manager.predict(request.model_name, series, n=1)
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
        logging.error(f"예측 수행 중 오류 발생: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction error: {e}")
