import pickle
import pandas as pd
from .redis_client import redis_client

CACHE_EXPIRY = 12 * 60 * 60 

def redis_get_df(key):
    raw = redis_client.get(key)
    if raw is not None:
        return pickle.loads(raw)
    return None

def redis_set_df(key, df, expire=CACHE_EXPIRY):
    redis_client.setex(key, expire, pickle.dumps(df))
