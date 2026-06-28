import numpy as np
from typing import Dict, Tuple, Any, List

class SupplyChainEnv:
    def __init__(
        self, 
        df, 
        initial_inventory: int = 100,
        holding_cost: float = 2.0,
        stockout_cost: float = 10.0,
        order_fixed_cost: float = 50.0,
        unit_cost: float = 10.0,
        unit_price: float = 20.0,
        lead_time: int = 5
    ):
        self.df = df
        self.initial_inventory = initial_inventory
        self.max_steps = len(df)
        self.current_step = 0
        
        self.state = None
        
        self.holding_cost_per_unit = holding_cost
        self.stockout_cost_per_unit = stockout_cost
        self.ordering_cost = order_fixed_cost
        self.unit_cost = unit_cost
        self.unit_price = unit_price
        self.lead_time = lead_time

        self.pending_orders: List[List[int]] = []

    def reset(self):
        self.current_step = 0
        self.inventory = self.initial_inventory
        self.pending_orders = []
        
        demand = self.df.iloc[self.current_step]['Demand']
        self.state = {
            'inventory': self.inventory,
            'demand': demand,
            'pending_orders': sum([o[1] for o in self.pending_orders])
        }
        return self.state

    def step(self, action):
        if action > 0:
            order_cost = self.ordering_cost + (action * self.unit_cost)
            self.pending_orders.append([self.lead_time, action])
        else:
            order_cost = 0

        arrived_quantity = 0
        new_pending_orders = []
        for days, qty in self.pending_orders:
            days -= 1
            if days <= 0:
                arrived_quantity += qty
            else:
                new_pending_orders.append([days, qty])
        self.pending_orders = new_pending_orders
        
        self.inventory += arrived_quantity

        current_demand = self.df.iloc[self.current_step]['Demand']
        sold_quantity = min(self.inventory, current_demand)
        lost_sales = current_demand - sold_quantity
        
        self.inventory -= sold_quantity
        holding_cost = self.inventory * self.holding_cost_per_unit
        stockout_cost = lost_sales * self.stockout_cost_per_unit
        
        revenue = sold_quantity * self.unit_price
        
        reward = revenue - (order_cost + holding_cost + stockout_cost)
        
        self.current_step += 1
        done = self.current_step >= self.max_steps - 1
        
        if not done:
            next_demand = self.df.iloc[self.current_step]['Demand']
            self.state = {
                'inventory': self.inventory,
                'demand': next_demand,
                'pending_orders': sum([o[1] for o in self.pending_orders])
            }
        
        info = {
            'sold': sold_quantity,
            'lost_sales': lost_sales,
            'inventory': self.inventory,
            'arrived': arrived_quantity
        }
        
        return self.state, reward, done, info
