import requests
import time
import sys

def test_integration():
    print("Testing Integration...")
    base_url = "http://127.0.0.1:3000/api"
    
    # Wait for server
    print("Waiting for server...")
    time.sleep(5)
    
    try:
        # Start Simulation
        resp = requests.post(f"{base_url}/start_simulation")
        if resp.status_code == 200:
            print("Simulation Started.")
            print(resp.json())
        else:
            print(f"Failed to start simulation. Code: {resp.status_code}")
            sys.exit(1)
            
        # Run a few steps
        for i in range(5):
            resp = requests.post(f"{base_url}/step")
            if resp.status_code == 200:
                print(f"Step {i}: {resp.json()}")
            else:
                print(f"Step failed. Code: {resp.status_code}")
                sys.exit(1)
                
        # Get Results
        resp = requests.get(f"{base_url}/results")
        if resp.status_code == 200:
            print("Results fetched.")
            print(resp.json()['metrics'])
        else:
            print("Failed to fetch results.")
            sys.exit(1)
            
        print("Integration Test Passed.")
        
    except Exception as e:
        print(f"Connection failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    test_integration()
