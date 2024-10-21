# app/utils.py

import logging
from typing import Tuple

import pandas as pd
from sklearn.preprocessing import StandardScaler


def preprocess_data(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
    """
    데이터 전처리 함수
    """
    try:
        # 필요한 컬럼 선택
        # 예시: Air Temperature (C) 예측
        features = df.drop(columns=["Air Temperature (C)", "timestamp"])
        target = df["Air Temperature (C)"]

        # 결측값 처리 (예: 평균값으로 대체)
        features.fillna(features.mean(), inplace=True)

        # 범주형 데이터 인코딩
        categorical_cols = ["Pump Status", "Fan Status", "Heater Status", "LED Lighting Status"]
        features = pd.get_dummies(features, columns=categorical_cols)

        # 특성 스케일링 (선택사항)
        scaler = StandardScaler()
        features_scaled = scaler.fit_transform(features)
        features = pd.DataFrame(features_scaled, columns=features.columns)

        logging.info("데이터 전처리 완료.")
        return features, target
    except Exception as e:
        logging.error(f"데이터 전처리 중 오류 발생: {e}")
        raise
