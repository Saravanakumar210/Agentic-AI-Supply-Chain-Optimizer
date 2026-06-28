import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Set random seed for reproducibility
np.random.seed(42)

# Configuration
num_days = 365 * 3  # 3 years of data
products = ['P001', 'P002', 'P003', 'P004', 'P005', 'P006', 'P007', 'P008', 'P009', 'P010']
start_date = datetime(2021, 1, 1)

# Product characteristics with names
product_config = {
    'P001': {'name': 'Television', 'base_demand': 100, 'lead_time': 5, 'cost': 10, 'price': 20, 'initial_inventory': 500},
    'P002': {'name': 'Mobile Phone', 'base_demand': 80, 'lead_time': 3, 'cost': 15, 'price': 30, 'initial_inventory': 400},
    'P003': {'name': 'Laptop', 'base_demand': 120, 'lead_time': 7, 'cost': 8, 'price': 18, 'initial_inventory': 600},
    'P004': {'name': 'Headphones', 'base_demand': 60, 'lead_time': 4, 'cost': 20, 'price': 40, 'initial_inventory': 300},
    'P005': {'name': 'Smart Watch', 'base_demand': 90, 'lead_time': 6, 'cost': 12, 'price': 25, 'initial_inventory': 450},
    'P006': {'name': 'Tablet', 'base_demand': 110, 'lead_time': 5, 'cost': 9, 'price': 22, 'initial_inventory': 550},
    'P007': {'name': 'Gaming Console', 'base_demand': 70, 'lead_time': 3, 'cost': 18, 'price': 35, 'initial_inventory': 350},
    'P008': {'name': 'Camera', 'base_demand': 95, 'lead_time': 4, 'cost': 11, 'price': 24, 'initial_inventory': 475},
    'P009': {'name': 'Cosmetics', 'base_demand': 85, 'lead_time': 6, 'cost': 14, 'price': 28, 'initial_inventory': 425},
    'P010': {'name': 'Home Appliance', 'base_demand': 105, 'lead_time': 5, 'cost': 10, 'price': 21, 'initial_inventory': 525}
}

# Generate data
data_rows = []

for product_id in products:
    config = product_config[product_id]
    inventory = config['initial_inventory']
    
    for day in range(num_days):
        current_date = start_date + timedelta(days=day)
        
        # Add seasonal variation (higher demand in winter months)
        month = current_date.month
        seasonal_factor = 1.0 + 0.3 * np.sin((month - 1) * np.pi / 6)
        
        # Add weekly pattern (lower demand on weekends)
        weekday = current_date.weekday()
        weekly_factor = 0.7 if weekday >= 5 else 1.0
        
        # Add random noise
        noise = np.random.normal(1.0, 0.15)
        
        # Calculate demand
        demand = int(config['base_demand'] * seasonal_factor * weekly_factor * noise)
        demand = max(0, demand)  # Ensure non-negative
        
        # Update inventory (simple logic: inventory decreases by demand)
        inventory = max(0, inventory - demand)
        
        # Restock if inventory is low (simulate ordering)
        if inventory < config['base_demand'] * 2:
            inventory += int(config['base_demand'] * 5)
        
        # Create row
        data_rows.append({
            'Date': current_date.strftime('%Y-%m-%d'),
            'Product_ID': product_id,
            'Product_Name': config['name'],
            'Demand': demand,
            'Inventory_Level': inventory,
            'Lead_Time_Days': config['lead_time'],
            'Unit_Cost': config['cost'],
            'Unit_Price': config['price']
        })

# Create DataFrame
df = pd.DataFrame(data_rows)

# Save to CSV
output_path = 'data/sample_data.csv'
df.to_csv(output_path, index=False)

print(f"Generated {len(df)} rows of synthetic data")
print(f"Date range: {df['Date'].min()} to {df['Date'].max()}")
print(f"\nFirst few rows:")
print(df.head(10))
print(f"\nDataset shape: {df.shape}")
print(f"Products: {df['Product_ID'].unique()}")
