import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from backend.data_loader import load_data, clean_data

def test_data_loader():
    print("Testing Data Loader...")
    filepath = "data/sample_data.csv"
    df = load_data(filepath)
    if df is not None:
        print("Data Loaded.")
        df_clean = clean_data(df)
        print("Data Cleaned.")
        
        from backend.data_loader import create_features
        df_features = create_features(df_clean)
        print("Features Created.")
        print(df_features.head())
        print(df_features.columns)
    else:
        print("Failed to load data.")

if __name__ == "__main__":
    test_data_loader()
