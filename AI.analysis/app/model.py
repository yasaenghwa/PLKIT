# app/model.py

from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from xgboost import XGBRegressor
from darts.models import TSMixerModel as TSMixer
from darts import TimeSeries
import joblib

class BaseModel:
    def train(self, X, y):
        raise NotImplementedError

    def predict(self, X):
        raise NotImplementedError

    def save(self, filepath):
        raise NotImplementedError

    def load(self, filepath):
        raise NotImplementedError

# TSMixer 정의 (Darts의 TSMixer 사용)
class TSMixerModel(BaseModel):
    def __init__(self, input_chunk_length=24, output_chunk_length=12, n_epochs=300, model_kwargs=None):
        if model_kwargs is None:
            model_kwargs = {}
        self.model = TSMixer(
            input_chunk_length=input_chunk_length,
            output_chunk_length=output_chunk_length,
            n_epochs=n_epochs,
            **model_kwargs
        )

    def train(self, series: TimeSeries):
        self.model.fit(series)

    def predict(self, series: TimeSeries, n: int) -> TimeSeries:
        return self.model.predict(n)

    def save(self, filepath):
        self.model.save(filepath)

    def load(self, filepath):
        self.model = TSMixer.load(filepath)
