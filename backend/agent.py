import numpy as np
import random

class QLearningAgent:
    def __init__(self, action_space, learning_rate=0.1, discount_factor=0.95, epsilon=0.1):
        self.q_table = {}
        self.learning_rate = learning_rate
        self.discount_factor = discount_factor
        self.epsilon = epsilon
        self.action_space = action_space

    def get_state_key(self, state):
        inv = state['inventory']
        if inv < 0: inv_bin = 'negative'
        elif inv < 20: inv_bin = 'low'
        elif inv < 100: inv_bin = 'medium'
        else: inv_bin = 'high'
        
        dem = state['demand']
        if dem < 50: dem_bin = 'low'
        elif dem < 100: dem_bin = 'medium'
        else: dem_bin = 'high'
        
        return (inv_bin, dem_bin, state['pending_orders'])

    def act(self, state):
        state_key = self.get_state_key(state)
        
        if random.uniform(0, 1) < self.epsilon:
            return random.choice(self.action_space)
        
        if state_key not in self.q_table:
            self.q_table[state_key] = np.zeros(len(self.action_space))
            
        return self.action_space[np.argmax(self.q_table[state_key])]

    def train(self, state, action, reward, next_state):
        state_key = self.get_state_key(state)
        next_state_key = self.get_state_key(next_state)
        
        if state_key not in self.q_table:
            self.q_table[state_key] = np.zeros(len(self.action_space))
        if next_state_key not in self.q_table:
            self.q_table[next_state_key] = np.zeros(len(self.action_space))
            
        action_index = self.action_space.index(action)
        
        best_next_action = np.max(self.q_table[next_state_key])
        td_target = reward + self.discount_factor * best_next_action
        td_error = td_target - self.q_table[state_key][action_index]
        self.q_table[state_key][action_index] += self.learning_rate * td_error
