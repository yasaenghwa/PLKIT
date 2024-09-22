from typing import Dict

import pandas as pd
import requests
from set_connection import get_server_url


def get_data_from_db() -> pd.DataFrame:
    url = get_server_url()
    response = requests.get(url, timeout=5)
    response.raise_for_status()
    json_data = response.json()

    sensors_df = pd.json_normalize(
        json_data["sensors"], sep="_", errors="ignore"
    ).filter(regex="value")

    controls_df = pd.json_normalize(
        json_data["controls"], sep="_", errors="ignore"
    ).filter(regex="status|value")

    combined_df = pd.concat([sensors_df, controls_df], axis=1)

    return combined_df
