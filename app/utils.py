# app/utils.py

import pandas as pd
import logging
from sklearn.preprocessing import StandardScaler
from darts import TimeSeries

def preprocess_data(df: pd.DataFrame) -> tuple:
    """
    데이터 전처리 함수
    - 결측값 처리
    - 중복 인덱스 제거
    - 스케일링
    - Darts TimeSeries 객체로 변환
    """
    try:
        # 타임스탬프 인덱스가 고유한지 확인
        if not df.index.is_unique:
            logging.warning("인덱스에 중복된 타임스탬프가 있습니다. 중복을 제거합니다.")
            df = df[~df.index.duplicated(keep='first')]

        # 결측값 처리 (전방 채우기)
        df.fillna(method='ffill', inplace=True)

        # 리샘플링하여 10분 간격으로 맞추기 (필요 시)
        df = df.resample('10T').ffill()

        # 스케일링
        scaler = StandardScaler()
        scaled_data = scaler.fit_transform(df)
        scaled_df = pd.DataFrame(scaled_data, index=df.index, columns=df.columns)

        # Darts TimeSeries 객체로 변환
        series_dict = {}
        for column in scaled_df.columns:
            series_dict[column] = TimeSeries.from_dataframe(
                scaled_df,
                value_cols=column,
                fill_missing_dates=True,
                freq='10T'  # 10분 간격으로 설정
            )

        logging.info("데이터 전처리 및 TimeSeries 객체 변환 완료.")
        return series_dict, scaler

    except Exception as e:
        logging.error(f"데이터 전처리 중 오류 발생: {e}")
        raise

def calculate_time_until_threshold(series: TimeSeries, threshold: float) -> int:
    """
    시계열 데이터에서 임계치 이하로 떨어지는 시점까지의 시간을 예측
    - series: Darts TimeSeries 객체
    - threshold: 임계치 (%)
    - 반환값: 임계치 도달까지의 시간 (예: 10분 단위)
    """
    try:
        for i, value in enumerate(series.values()):
            if value <= threshold:
                return i * 10
        return -1
    except Exception as e:
        logging.error(f"임계치 도달 시간 계산 중 오류 발생: {e}")
        raise
