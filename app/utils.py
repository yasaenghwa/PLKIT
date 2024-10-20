# app/utils.py

import numpy as np
import pandas as pd
import torch
from sklearn.preprocessing import StandardScaler


def preprocess_input(data: dict, scaler_X: StandardScaler, seq_length: int, num_features: int) -> torch.Tensor:
    """
    클라이언트로부터 받은 JSON 데이터를 전처리하여 모델 입력 형식으로 변환
    :param data: 클라이언트로부터 받은 데이터 (딕셔너리)
    :param scaler_X: 학습 시 사용한 StandardScaler 객체
    :param seq_length: 시퀀스 길이
    :param num_features: 특성 수
    :return: 전처리된 데이터 텐서
    """
    # 데이터프레임으로 변환
    df = pd.DataFrame([data])

    # 필요한 전처리 수행 (예: 스케일링)
    X_scaled = scaler_X.transform(df)

    # 시퀀스 생성 (단일 시퀀스로 가정)
    # 실제 사용 시 여러 시퀀스를 처리할 수 있도록 수정 필요
    if X_scaled.shape[0] < seq_length:
        # 시퀀스 길이에 맞게 패딩 또는 다른 처리 필요
        raise ValueError("데이터 시퀀스가 충분하지 않습니다.")

    # 시퀀스 길이에 맞게 슬라이딩 윈도우 적용
    X_seq = X_scaled[-seq_length:]

    # 텐서로 변환
    X_tensor = torch.tensor(X_seq, dtype=torch.float32).unsqueeze(0)  # (1, seq_length, num_features)

    return X_tensor

def postprocess_output(prediction: float, scaler_y: StandardScaler) -> float:
    """
    모델의 예측 결과를 후처리하여 원래 스케일로 되돌림
    :param prediction: 모델의 예측값
    :param scaler_y: 학습 시 사용한 y 스케일러
    :return: 후처리된 예측값
    """
    prediction = np.array(prediction).reshape(-1, 1)
    prediction_original = scaler_y.inverse_transform(prediction).flatten()[0]
    return prediction_original
