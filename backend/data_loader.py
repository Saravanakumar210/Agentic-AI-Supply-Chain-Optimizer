import pandas as pd
import numpy as np

def load_data(filepath):
    try:
        df = pd.read_csv(filepath)
        print(f"Data loaded successfully from {filepath}. Shape: {df.shape}")
        return df
    except Exception as e:
        print(f"Error loading data: {e}")
        return None

def clean_data(df):
    if df is None:
        return None
    
    if 'Date' in df.columns:
        df['Date'] = pd.to_datetime(df['Date'])
    
    df.ffill(inplace=True)
    
    return df

def create_features(df):
    if df is None:
        return None
    
    if 'Date' in df.columns:
        df['Day'] = df['Date'].dt.day
        df['Month'] = df['Date'].dt.month
        df['DayOfWeek'] = df['Date'].dt.dayofweek
    
    if 'Demand' in df.columns:
        df['Demand_Lag_1'] = df['Demand'].shift(1)
        df['Demand_Rolling_Mean_3'] = df['Demand'].rolling(window=3).mean()
    
    df.dropna(inplace=True)
    
    return df
