import torch
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from app.model import StockRNN
from app.data_collector import get_stock_data
from app.redis.cache_utils import redis_get_df, redis_set_df
import joblib

WINDOW_SIZE = 10

scaler: MinMaxScaler = joblib.load('saved_models/scaler.pkl')
model = StockRNN()
model.load_state_dict(torch.load('saved_models/latest.pth'))
model.eval()

async def fetch_data(symbol):
    key = f"{symbol}_data"
    df = redis_get_df(key)
    if df is not None:
        return df

    df = get_stock_data(symbol)
    redis_set_df(key, df)
    return df

async def predict_next_price(symbol='AAPL', days=10):
    df = await fetch_data(symbol)
    prices = df['Close'].values.reshape(-1, 1)
    scaled = scaler.transform(prices)

    sequence = scaled[-WINDOW_SIZE:].tolist()
    predictions = []

    model.eval()
    with torch.no_grad():
        for _ in range(days):
            seq_input = torch.tensor(sequence[-WINDOW_SIZE:], dtype=torch.float32).unsqueeze(0)
            pred = model(seq_input).numpy()
            predictions.append(pred[0][0])
            sequence.append([pred[0][0]])

    predicted_prices = scaler.inverse_transform(np.array(predictions).reshape(-1, 1)).flatten()
    return predicted_prices.tolist()
