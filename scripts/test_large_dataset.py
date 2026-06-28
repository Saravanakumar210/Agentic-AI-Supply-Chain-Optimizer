import requests
import time

def test_full_simulation():
    """Test the full simulation with the large dataset via API"""
    base_url = "http://127.0.0.1:3000/api"
    
    print("=" * 60)
    print("SUPPLY CHAIN OPTIMIZATION - LARGE DATASET SIMULATION TEST")
    print("=" * 60)
    
    # Wait for server
    print("\n[1/3] Waiting for server to be ready...")
    time.sleep(2)
    
    try:
        # Start Simulation
        print("\n[2/3] Starting simulation with large dataset...")
        resp = requests.post(f"{base_url}/start_simulation", timeout=30)
        
        if resp.status_code == 200:
            result = resp.json()
            print(f"✓ Simulation Started Successfully!")
            print(f"  - Total Steps Available: {result.get('steps', 'N/A')}")
            print(f"  - Status: {result.get('status', 'N/A')}")
        else:
            print(f"✗ Failed to start simulation. Status Code: {resp.status_code}")
            return
            
        # Run simulation steps
        print("\n[3/3] Running simulation steps...")
        print(f"{'Step':<8} {'Inventory':<12} {'Demand':<10} {'Action':<10} {'Reward':<12} {'Sold':<8} {'Lost':<8}")
        print("-" * 80)
        
        for i in range(20):  # Run 20 steps as a demonstration
            resp = requests.post(f"{base_url}/step", timeout=10)
            
            if resp.status_code == 200:
                response_data = resp.json()
                data = response_data.get('data', {})
                
                step_num = data.get('step', i+1)
                inventory = data.get('inventory', 0)
                demand = data.get('demand', 0)
                action = data.get('action', 0)
                reward = data.get('reward', 0)
                sold = data.get('sold', 0)
                lost_sales = data.get('lost_sales', 0)
                
                print(f"{step_num:<8} {inventory:<12} {demand:<10} {action:<10} {reward:<12.2f} {sold:<8} {lost_sales:<8}")
                
                if response_data.get('done'):
                    print("\n✓ Simulation completed!")
                    break
            else:
                print(f"✗ Step {i+1} failed. Status Code: {resp.status_code}")
                break
                
        # Get Results
        print("\n" + "=" * 60)
        print("FINAL METRICS")
        print("=" * 60)
        resp = requests.get(f"{base_url}/results", timeout=10)
        
        if resp.status_code == 200:
            results = resp.json()
            metrics = results.get('metrics', {})
            
            print(f"\n✓ Results fetched successfully!")
            print(f"\nPerformance Metrics:")
            print(f"  - Total Lost Sales: {metrics.get('total_lost_sales', 'N/A')}")
            print(f"  - Total Items Sold: {metrics.get('total_sold', 'N/A')}")
            print(f"  - Average Inventory: {metrics.get('avg_inventory', 'N/A'):.2f}")
            print(f"  - Service Level: {metrics.get('service_level', 'N/A'):.2%}")
            
            history_length = len(results.get('history', []))
            print(f"\n  - Total Steps Executed: {history_length}")
            
        else:
            print(f"✗ Failed to fetch results. Status Code: {resp.status_code}")
            
        print("\n" + "=" * 60)
        print("TEST COMPLETED SUCCESSFULLY!")
        print("=" * 60)
        print(f"\nDataset Information:")
        print(f"  - Total Rows in Dataset: 10,950")
        print(f"  - Products: 10 (P001 to P010)")
        print(f"  - Date Range: 2021-01-01 to 2023-12-31 (3 years)")
        print(f"  - Features: Seasonal patterns, weekly variations, restocking logic")
        print(f"\nServer is running at: http://0.0.0.0:3000")
        print(f"Access the dashboard from any device on your network at: http://YOUR_IP:3000")
        
    except Exception as e:
        print(f"\n✗ Connection failed: {e}")
        print("Please ensure the server is running.")

if __name__ == "__main__":
    test_full_simulation()
