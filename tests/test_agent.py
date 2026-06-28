import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from backend.data_loader import load_data, clean_data
from backend.environment import SupplyChainEnv
from backend.agent import QLearningAgent

def test_agent():
    print("Testing Agent...")
    filepath = "data/sample_data.csv"
    df = load_data(filepath)
    df = clean_data(df)
    
    env = SupplyChainEnv(df)
    action_space = [0, 50, 100]
    agent = QLearningAgent(action_space)
    
    # Training Loop (1 Episode for test)
    state = env.reset()
    done = False
    total_reward = 0
    
    steps = 0
    while not done:
        action = agent.act(state)
        next_state, reward, done, info = env.step(action)
        
        agent.train(state, action, reward, next_state)
        
        state = next_state
        total_reward += reward
        steps += 1
        
    print(f"Episode finished. Total Reward: {total_reward}. Steps: {steps}")
    print(f"Q-Table size: {len(agent.q_table)}")

if __name__ == "__main__":
    test_agent()
