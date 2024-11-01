from fastapi import FastAPI, HTTPException, APIRouter
from datetime import datetime
from typing import Dict, Any
from pydantic import BaseModel

# APIRouter 인스턴스 생성
router = APIRouter()

# 최근 센서 및 제어 데이터를 저장할 변수
latest_data: Dict[str, Any] = {}


# Pydantic 모델 정의
class SensorControlData(BaseModel):
    sensors: Dict[str, Any]
    controls: Dict[str, Any]


@router.get("/data", response_model=Dict[str, Any])
def get_latest_sensor_data():
    """
    최근 센서 및 제어 데이터를 반환하는 API
    """
    if not latest_data:
        raise HTTPException(status_code=404, detail="No sensor data available")
    return latest_data


@router.post("/data", response_model=Dict[str, Any])
def update_sensor_data(data: SensorControlData):
    """
    센서 및 제어 데이터를 업데이트하는 API
    """
    global latest_data
    # 데이터에 타임스탬프 추가
    latest_data = {
        "timestamp": datetime.now().isoformat(),
        "sensors": data.sensors,
        "controls": data.controls,
    }
    return latest_data
