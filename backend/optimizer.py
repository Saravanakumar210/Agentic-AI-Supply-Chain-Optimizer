import pandas as pd
import numpy as np
from typing import List, Dict, Any

class Optimizer:
    def __init__(self):
        pass

    def calculate_metrics(self, history: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not history:
            return {}
            
        df = pd.DataFrame(history)
        
        total_lost_sales = df['lost_sales'].sum()
        total_sold = df['sold'].sum()
        avg_inventory = df['inventory'].mean()
        
        service_level = total_sold / (total_sold + total_lost_sales) if (total_sold + total_lost_sales) > 0 else 0
        inventory_turnover = total_sold / avg_inventory if avg_inventory > 0 else 0
        
        metrics = {
            'total_lost_sales': int(total_lost_sales),
            'total_sold': int(total_sold),
            'avg_inventory': round(float(avg_inventory), 2),
            'service_level': round(float(service_level), 4),
            'inventory_turnover': round(float(inventory_turnover), 2)
        }
        
        return metrics
