import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from backend.data_loader import load_data, clean_data
from backend.environment import SupplyChainEnv

def test_environment():
    print("Testing Environment...")
    filepath = "data/sample_data.csv"
    df = load_data(filepath)
    df = clean_data(df)
    
    env = SupplyChainEnv(df)
    state = env.reset()
    print(f"Initial State: {state}")
    
    done = False
    total_reward = 0
    step = 0
    while not done:
        # Simple policy: Order 50 if inventory < 50
        action = 0
        if state['inventory'] < 50:
            action = 50
        
        state, reward, done, info = env.step(action)
        total_reward += reward
        print(f"Step {step}: Action={action}, Reward={reward}, Info={info}")
        step += 1
    
    print(f"Total Reward: {total_reward}")

if __name__ == "__main__":
    test_environment()
