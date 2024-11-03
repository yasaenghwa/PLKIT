import pandas as pd
import logging
from sklearn.preprocessing import StandardScaler
from darts import TimeSeries

def preprocess_data(df: pd.DataFrame) -> tuple:
    try:
        if not df.index.is_unique:
            logging.warning("인덱스에 중복된 타임스탬프가 있습니다. 중복을 제거합니다.")
            df = df[~df.index.duplicated(keep='first')]

        df.fillna(method='ffill', inplace=True)

        df = df.resample('10T').ffill()

        scaler = StandardScaler()
        scaled_data = scaler.fit_transform(df)
        scaled_df = pd.DataFrame(scaled_data, index=df.index, columns=df.columns)

        series_dict = {}
        for column in scaled_df.columns:
            series_dict[column] = TimeSeries.from_dataframe(
                scaled_df,
                value_cols=column,
                fill_missing_dates=True,
                freq='10T'
            )

        logging.info("데이터 전처리 및 TimeSeries 객체 변환 완료.")
        return series_dict, scaler

    except Exception as e:
        logging.error(f"데이터 전처리 중 오류 발생: {e}")
        raise

def calculate_time_until_threshold(series: TimeSeries, threshold: float) -> int:
    try:
        for i, value in enumerate(series.values()):
            if value <= threshold:
                return i * 10
        return -1
    except Exception as e:
        logging.error(f"임계치 도달 시간 계산 중 오류 발생: {e}")
        raise
