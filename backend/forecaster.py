from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error
import numpy as np
import pandas as pd

class Forecaster:
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.features = ['Demand_Lag_1', 'Demand_Rolling_Mean_3', 'Day', 'Month', 'DayOfWeek']

    def train(self, df):
        X = df[self.features]
        y = df['Demand']
        
        self.model.fit(X, y)
        print("Model trained.")

    def predict(self, df):
        X = df[self.features]
        return self.model.predict(X)

    def evaluate(self, df):
        X = df[self.features]
        y = df['Demand']
        predictions = self.model.predict(X)
        mse = mean_squared_error(y, predictions)
        rmse = np.sqrt(mse)
        print(f"RMSE: {rmse}")
        return rmse
