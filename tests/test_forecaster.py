import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

import pandas as pd
from backend.data_loader import load_data, clean_data, create_features
from backend.forecaster import Forecaster

def test_forecaster():
    print("Testing Forecaster...")
    filepath = "data/sample_data.csv"
    df = load_data(filepath)
    df = clean_data(df)
    df = create_features(df)
    
    # Split train/test (simple split)
    train_size = int(len(df) * 0.8)
    train_df = df.iloc[:train_size]
    test_df = df.iloc[train_size:]
    
    forecaster = Forecaster()
    forecaster.train(train_df)
    
    print("Evaluating on test set...")
    rmse = forecaster.evaluate(test_df)
    print(f"Test RMSE: {rmse}")

    # Test prediction
    sample_input = test_df.iloc[[0]]
    pred = forecaster.predict(sample_input)
    print(f"Prediction for {sample_input['Date'].values[0]}: {pred[0]}")

if __name__ == "__main__":
    test_forecaster()
