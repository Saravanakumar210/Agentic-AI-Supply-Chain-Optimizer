import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from backend.optimizer import Optimizer

def test_optimizer():
    print("Testing Optimizer...")
    
    # Mock history
    history = [
        {'sold': 100, 'lost_sales': 0, 'inventory': 50},
        {'sold': 90, 'lost_sales': 10, 'inventory': 40},
        {'sold': 80, 'lost_sales': 20, 'inventory': 30}
    ]
    
    optimizer = Optimizer()
    metrics = optimizer.calculate_metrics(history)
    
    print(f"Metrics: {metrics}")
    
    # Basic assertions
    assert metrics['total_lost_sales'] == 30
    assert metrics['total_sold'] == 270
    print("Optimizer Test Passed.")

if __name__ == "__main__":
    test_optimizer()
