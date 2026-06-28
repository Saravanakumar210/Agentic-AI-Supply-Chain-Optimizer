from flask import Flask, jsonify, render_template, send_from_directory
import os
import sys
import pandas as pd

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from data_loader import load_data, clean_data, create_features
from environment import SupplyChainEnv
from agent import QLearningAgent
from optimizer import Optimizer

app = Flask(__name__, static_folder='../frontend', template_folder='../frontend')

env = None
agent = None
history = []

@app.route('/')
def home():
    return send_from_directory('../frontend', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('../frontend', path)

@app.route('/api/start_simulation', methods=['POST'])
def start_simulation():
    global env, agent, history
    try:
        filepath = os.path.join(os.path.dirname(__file__), '../data/sample_data.csv')
        df = load_data(filepath)
        df = clean_data(df)
        df = create_features(df)
        
        env = SupplyChainEnv(df)
        action_space = [0, 50, 100]
        agent = QLearningAgent(action_space)
        history = []
        
        return jsonify({"status": "Simulation Started", "steps": len(df)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/step', methods=['POST'])
def step():
    global env, agent, history
    if env is None:
        return jsonify({"error": "Simulation not started"}), 400
        
    try:
        state = env.state if env.state else env.reset()
        action = agent.act(state)
        next_state, reward, done, info = env.step(action)
        
        if env.state:
             agent.train(state, action, reward, next_state)
             
        step_data = {
            "step": int(env.current_step),
            "inventory": int(info['inventory']),
            "demand": int(state['demand']),
            "action": int(action),
            "reward": float(reward),
            "sold": int(info['sold']),
            "lost_sales": int(info['lost_sales'])
        }
        history.append(step_data)
        
        return jsonify({"done": done, "data": step_data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/results', methods=['GET'])
def results():
    global history
    optimizer = Optimizer()
    metrics = optimizer.calculate_metrics(history)
    return jsonify({"metrics": metrics, "history": history})

@app.route('/api/download_dataset', methods=['GET'])
def download_dataset():
    dataset_path = os.path.join(os.path.dirname(__file__), '../data/sample_data.csv')
    return send_from_directory(os.path.dirname(dataset_path), 'sample_data.csv', 
                              as_attachment=True, 
                              download_name='supply_chain_dataset.csv')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=3000)
