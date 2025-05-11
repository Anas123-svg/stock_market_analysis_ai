from fastapi import FastAPI
from app.predict import predict_next_price
from app.cors import add_cors_middleware
import pandas as pd

app = FastAPI()
add_cors_middleware(app)

@app.get("/predict")
async def get_prediction(symbol: str = 'AAPL', days: int = 10):
    try:
        predicted_prices = await predict_next_price(symbol, days)
        today = pd.Timestamp.today()
        prediction_list = [
            {"date": (today + pd.Timedelta(days=i + 1)).strftime("%Y-%m-%d"), "price": round(p, 2)}
            for i, p in enumerate(predicted_prices)
        ]
        return {"symbol": symbol, "predictions": prediction_list}
    except Exception as e:
        return {"error": str(e)}
