import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
import numpy as np
import joblib
from sklearn.preprocessing import MinMaxScaler
from app.model import StockRNN
from app.data_collector import get_stock_data

WINDOW_SIZE = 10

def create_sequences(data, window):
    X, y = [], []
    for i in range(len(data) - window):
        X.append(data[i:i + window])
        y.append(data[i + window])
    return np.array(X), np.array(y)

def fine_tune_model(symbol='AAPL'):
    df = get_stock_data(symbol)
    prices = df['Close'].values.reshape(-1, 1)
    scaler: MinMaxScaler = joblib.load('saved_models/scaler.pth')
    scaled_prices = scaler.transform(prices)

    X, y = create_sequences(scaled_prices, WINDOW_SIZE)
    X, y = torch.tensor(X, dtype=torch.float32), torch.tensor(y, dtype=torch.float32)
    X = X.unsqueeze(-1)

    dataset = TensorDataset(X, y)
    loader = DataLoader(dataset, batch_size=32, shuffle=True)

    model = StockRNN()
    model.load_state_dict(torch.load('saved_models/latest.pth'))

    optimizer = torch.optim.Adam(model.parameters(), lr=0.0001)  
    loss_fn = nn.MSELoss()

    for epoch in range(5): 
        for xb, yb in loader:
            pred = model(xb)
            loss = loss_fn(pred, yb)
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

    torch.save(model.state_dict(), 'saved_models/latest.pth')
