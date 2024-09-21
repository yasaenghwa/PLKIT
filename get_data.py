import pandas as pd

def get_data_from_db() -> pd.DataFrame:
    return pd.read_csv("data.csv")

