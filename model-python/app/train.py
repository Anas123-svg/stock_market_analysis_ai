import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
from sklearn.preprocessing import MinMaxScaler
import numpy as np
from app.model import StockRNN
from app.data_collector import get_stock_data
import joblib

WINDOW_SIZE = 10

def create_sequences(data, window):
    X, y = [], []
    for i in range(len(data) - window):
        X.append(data[i:i + window])
        y.append(data[i + window])
    return np.array(X), np.array(y)

def train_model(symbol='AAPL'):
    df = get_stock_data(symbol)
    prices = df['Close'].values.reshape(-1, 1)
    scaler = MinMaxScaler()
    scaled_prices = scaler.fit_transform(prices)

    X, y = create_sequences(scaled_prices, WINDOW_SIZE)
    X, y = torch.tensor(X, dtype=torch.float32), torch.tensor(y, dtype=torch.float32)
    X = X.view(X.shape[0], X.shape[1], 1)

    dataset = TensorDataset(X, y)
    loader = DataLoader(dataset, batch_size=32, shuffle=True)

    model = StockRNN()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
    loss_fn = nn.MSELoss()

    for epoch in range(30):
        epoch_loss = 0
        for i, (xb, yb) in enumerate(loader):
            pred = model(xb)
            loss = loss_fn(pred, yb)
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            
            epoch_loss += loss.item()

            if (i + 1) % 100 == 0:
                print(f"Epoch [{epoch+1}/30], Iteration [{i+1}/{len(loader)}], Loss: {loss.item():.4f}")

        avg_epoch_loss = epoch_loss / len(loader)
        print(f"Epoch [{epoch+1}/30] completed. Average Loss: {avg_epoch_loss:.4f}")

    torch.save(model.state_dict(), 'saved_models/latest.pth')
    #torch.save(scaler, 'saved_models/scaler.pth')
    joblib.dump(scaler, 'saved_models/scaler.pkl') 
    print("Model and scaler saved.")
if __name__ == "__main__":
    train_model()
