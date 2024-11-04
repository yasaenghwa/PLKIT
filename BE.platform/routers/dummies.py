from fastapi import APIRouter
from typing import Dict, Any, List

# APIRouter 인스턴스 생성
router = APIRouter()

# tempHumData.json 데이터
temp_hum_data = [
    {"name": "10/1", "temp": 24, "hum": 65},
    {"name": "10/2", "temp": 25, "hum": 66},
    {"name": "10/3", "temp": 26, "hum": 64},
    {"name": "10/4", "temp": 27, "hum": 63},
    {"name": "10/5", "temp": 28, "hum": 62},
    {"name": "10/6", "temp": 29, "hum": 61},
    {"name": "10/7", "temp": 30, "hum": 60},
]

# waterLevelData.json 데이터
water_level_data = [
    {"name": "water level", "value": 60},
    {"name": "nutrient level", "value": 45},
    {"name": "recycle level", "value": 50},
    {"name": "smartfarm level", "value": 55},
]

# illuminationData.json 데이터
illumination_data = [
    {"name": "10/1", "light": 400},
    {"name": "10/2", "light": 420},
    {"name": "10/3", "light": 440},
    {"name": "10/4", "light": 460},
    {"name": "10/5", "light": 480},
    {"name": "10/6", "light": 500},
    {"name": "10/7", "light": 520},
]

# tdsData.json 데이터
tds_data = [
    {"name": "1일", "tds": 700},
    {"name": "2일", "tds": 710},
    {"name": "3일", "tds": 720},
    {"name": "4일", "tds": 730},
    {"name": "5일", "tds": 740},
    {"name": "6일", "tds": 750},
    {"name": "7일", "tds": 760},
]

# liquidTempData.json 데이터
liquid_temp_data = [
    {"name": "10/1", "temp": 18},
    {"name": "10/2", "temp": 19},
    {"name": "10/3", "temp": 20},
    {"name": "10/4", "temp": 21},
    {"name": "10/5", "temp": 22},
    {"name": "10/6", "temp": 23},
    {"name": "10/7", "temp": 24},
]

# predictionData.json 데이터
prediction_data = [
    {"name": "1일", "water": 40, "nutrient": 30},
    {"name": "2일", "water": 45, "nutrient": 32},
    {"name": "3일", "water": 50, "nutrient": 34},
    {"name": "4일", "water": 55, "nutrient": 36},
    {"name": "5일", "water": 60, "nutrient": 38},
    {"name": "6일", "water": 65, "nutrient": 40},
    {"name": "7일", "water": 70, "nutrient": 42},
]

# 각각의 데이터에 대한 라우터 설정


@router.get("/status/temp_hum", response_model=List[Dict[str, Any]])
def get_temp_hum_data():
    """
    tempHumData.json 데이터를 반환하는 API
    """
    return temp_hum_data


@router.get("/status/water_level", response_model=List[Dict[str, Any]])
def get_water_level_data():
    """
    waterLevelData.json 데이터를 반환하는 API
    """
    return water_level_data


@router.get("/status/illumination", response_model=List[Dict[str, Any]])
def get_illumination_data():
    """
    illuminationData.json 데이터를 반환하는 API
    """
    return illumination_data


@router.get("/status/tds", response_model=List[Dict[str, Any]])
def get_tds_data():
    """
    tdsData.json 데이터를 반환하는 API
    """
    return tds_data


@router.get("/status/liquid_temp", response_model=List[Dict[str, Any]])
def get_liquid_temp_data():
    """
    liquidTempData.json 데이터를 반환하는 API
    """
    return liquid_temp_data


@router.get("/status/prediction", response_model=List[Dict[str, Any]])
def get_prediction_data():
    """
    predictionData.json 데이터를 반환하는 API
    """
    return prediction_data
