# app/model.py

import joblib
import torch
import torch.nn as nn
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from torchtsmixer import TSMixer
from xgboost import XGBRegressor


class BaseModel:
    def train(self, X, y):
        raise NotImplementedError

    def predict(self, X):
        raise NotImplementedError

    def save(self, filepath):
        joblib.dump(self.model, filepath)

    def load(self, filepath):
        self.model = joblib.load(filepath)

class RandomForestModel(BaseModel):
    def __init__(self, n_estimators=100, random_state=42):
        self.model = RandomForestRegressor(n_estimators=n_estimators, random_state=random_state)

    def train(self, X, y):
        self.model.fit(X, y)

    def predict(self, X):
        return self.model.predict(X)

class LinearRegressionModel(BaseModel):
    def __init__(self):
        self.model = LinearRegression()

    def train(self, X, y):
        self.model.fit(X, y)

    def predict(self, X):
        return self.model.predict(X)

class XGBoostModel(BaseModel):
    def __init__(self, n_estimators=100, random_state=42):
        self.model = XGBRegressor(n_estimators=n_estimators, random_state=random_state)

    def train(self, X, y):
        self.model.fit(X, y)

    def predict(self, X):
        return self.model.predict(X)

# LSTM 모델 정의
class LSTMModel(BaseModel):
    def __init__(self, input_size, hidden_size, num_layers, output_size):
        super(LSTMModel, self).__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.model = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, output_size)

    def train_model(self, X, y, epochs=100, learning_rate=0.001):
        criterion = nn.MSELoss()
        optimizer = torch.optim.Adam(self.model.parameters(), lr=learning_rate)

        for epoch in range(epochs):
            self.model.train()
            inputs = torch.tensor(X, dtype=torch.float32)
            targets = torch.tensor(y.values, dtype=torch.float32).unsqueeze(1)

            outputs, _ = self.model(inputs)
            outputs = self.fc(outputs[:, -1, :])

            loss = criterion(outputs, targets)
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

            if (epoch+1) % 10 == 0:
                print(f'Epoch [{epoch+1}/{epochs}], Loss: {loss.item():.4f}')

    def train(self, X, y):
        self.train_model(X, y)

    def predict(self, X):
        self.model.eval()
        with torch.no_grad():
            inputs = torch.tensor(X, dtype=torch.float32)
            outputs, _ = self.model(inputs)
            outputs = self.fc(outputs[:, -1, :])
            return outputs.numpy().flatten()

    def save(self, filepath):
        torch.save(self.model.state_dict(), filepath)

    def load(self, filepath):
        # LSTM 모델을 로드하려면, 모델 아키텍처를 먼저 정의해야 합니다.
        # 여기서는 간단히 파일을 로드하는 예시를 제공합니다.
        # 실제 사용 시, 모델 아키텍처를 일치시켜야 합니다.
        raise NotImplementedError("LSTM 모델 로드는 수동으로 아키텍처를 맞춰야 합니다.")

# tsmixer 모델 정의
class TSMixerModel(BaseModel):
    def __init__(self, config=None):
        self.model = TSMixer(config=config)  # tsmixer의 TimeSeriesModel 사용

    def train(self, X, y):
        self.model.fit(X, y)

    def predict(self, X):
        return self.model.predict(X)

    def save(self, filepath):
        joblib.dump(self.model, filepath)

    def load(self, filepath):
        self.model = joblib.load(filepath)
