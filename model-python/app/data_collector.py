import os
import requests
import pandas as pd
from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).resolve().parents[1] / '.env'
load_dotenv(dotenv_path=env_path)
API_KEY = os.getenv("POLYGON_API_KEY")

def get_stock_data(symbol='AAPL'):
    url = f"https://api.polygon.io/v2/aggs/ticker/{symbol}/range/1/day/2024-01-01/{pd.Timestamp.today().strftime('%Y-%m-%d')}?adjusted=true&sort=asc&limit=50000&apiKey={API_KEY}"
    
    response = requests.get(url)
    response.raise_for_status()
    results = response.json().get("results", [])

    df = pd.DataFrame(results)
    df['t'] = pd.to_datetime(df['t'], unit='ms')
    df.set_index('t', inplace=True)
    df.rename(columns={'c': 'Close'}, inplace=True)

    return df[['Close']]
