import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import torch.optim as optim
from get_data import get_data_from_db
from sklearn.model_selection import train_test_split


def set_model() -> nn.Module:
    return nn.Module()


def train_model(X_train: pd.DataFrame, y_train: pd.Series, model: nn.Module) -> None:
    pass


def evaluate_model(X_test: pd.DataFrame, y_test: pd.Series, model: nn.Module) -> None:
    pass


def save_model(model: nn.Module, path: str) -> None:
    torch.save(model.state_dict(), path)
    pass


if __name__ == "__main__":
    data = get_data_from_db()
    X_train, X_test, y_train, y_test = train_test_split(
        data.drop("target", axis=1), data["target"], test_size=0.1
    )

    model = set_model()

    train_model(X_train, y_train, model)
    evaluate_model(X_test, y_test, model)
    save_model(model, "model.pth")
