# 🤖 Agentic AI-Driven Optimization for Intelligent Supply Chain Management

<div align="center">

![Python](https://img.shields.io/badge/Python-3.10+-blue?style=for-the-badge&logo=python)
![Flask](https://img.shields.io/badge/Flask-3.1.2-black?style=for-the-badge&logo=flask)
![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.8.0-orange?style=for-the-badge&logo=scikit-learn)
![Pandas](https://img.shields.io/badge/Pandas-3.0.0-purple?style=for-the-badge&logo=pandas)
![NumPy](https://img.shields.io/badge/NumPy-2.3.5-013243?style=for-the-badge&logo=numpy)
![Chart.js](https://img.shields.io/badge/Chart.js-Frontend-FF6384?style=for-the-badge&logo=chartdotjs)

**An end-to-end self-learning AI agent that autonomously manages inventory, forecasts demand, and optimizes supply chain decisions using Reinforcement Learning and Machine Learning.**

[🚀 Demo](#-live-demo) · [📊 Features](#-features) · [🧠 Architecture](#-system-architecture) · [⚙️ Installation](#-installation) · [📈 Results](#-results)

</div>

---

## Screenshots

![Dashboard](Screenshorts/Initial%20Dashboard.png)

![Charts Visualization](Screenshorts/Charts%20Visualization.png)

![AI Decision](Screenshorts/AI%20Decision.png)

![Profit, Service and Inventory](Screenshorts/Profit,Service%20and%20Inventory.png)

## 📌 Project Overview

Traditional supply chain systems rely on static rules and manual intervention — failing to adapt to real-world demand fluctuations. This project builds an **autonomous AI agent** that:

- **Learns** optimal inventory ordering policies through **Q-Learning (Reinforcement Learning)**
- **Predicts** future demand using **Random Forest Regression**
- **Simulates** real supply chain dynamics with inventory, lead times, stockouts, and profit
- **Visualizes** all decisions in a real-time interactive web dashboard

> > 🎓 M.Sc. Data Science | 2026 Passout | CGPA: 8.2 | The American College, Madurai | Madurai Kamaraj University

---

## ✨ Features

| Feature | Description |
|--------|-------------|
| 🧠 Q-Learning Agent | Self-learning RL agent that improves inventory decisions over 10,950 timesteps |
| 📈 Demand Forecasting | Random Forest model predicts demand using lag features and rolling averages |
| 🏭 Supply Chain Simulation | Full environment with lead times, holding costs, stockouts, and profit rewards |
| 📊 Real-Time Dashboard | Interactive Flask + Chart.js UI showing live inventory, demand, and profit metrics |
| 🗃️ Large Dataset | 10,950 rows × 8 columns covering 10 product categories over 3 years (2021–2023) |
| 📐 Mathematical Optimization | KPI engine computing service level, inventory turnover, and lost sales |

---

## 🧠 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA PIPELINE                            │
│  supply_chain_dataset.csv → data_loader.py                  │
│  (Lag Features, Rolling Mean, Date Features)                │
└────────────────────┬────────────────────────────────────────┘
                     │
          ┌──────────▼──────────┐
          │   forecaster.py     │
          │  Random Forest      │
          │  Demand Prediction  │
          └──────────┬──────────┘
                     │
          ┌──────────▼──────────┐
          │  environment.py     │◄──────────────────┐
          │  Supply Chain Sim   │                   │
          │  Inventory Dynamics │                   │
          └──────────┬──────────┘                   │
                     │ state, reward                 │ action
          ┌──────────▼──────────┐                   │
          │     agent.py        │───────────────────►│
          │   Q-Learning RL     │
          │  ε-Greedy Policy    │
          └──────────┬──────────┘
                     │
          ┌──────────▼──────────┐
          │   optimizer.py      │
          │  KPI Calculation    │
          │  Service Level, ROI │
          └──────────┬──────────┘
                     │
          ┌──────────▼──────────┐
          │  app.py + Flask API │
          │  Real-Time Dashboard│
          │  Chart.js Frontend  │
          └─────────────────────┘
```

---

## 🔬 Algorithms & Mathematical Foundation

### 1. Demand Forecasting — Random Forest Regression

The forecaster uses an ensemble of 100 decision trees trained on time-series features:

- **Features:** `Demand_Lag₁`, `Rolling_Mean₃`, `Day`, `Month`, `DayOfWeek`
- **Evaluation:** RMSE (Root Mean Squared Error)

```
ŷ = (1/N) Σ Tᵢ(x)   where N=100 trees
```

### 2. Q-Learning Agent — Reinforcement Learning

The agent learns optimal ordering policy through interaction with the supply chain environment:

**Q-Value Update Rule:**
```
Q(s,a) ← Q(s,a) + α[r + γ·max Q(s',a') - Q(s,a)]
```

| Parameter | Value | Description |
|-----------|-------|-------------|
| α (learning rate) | 0.1 | How fast the agent updates beliefs |
| γ (discount factor) | 0.95 | Importance of future rewards |
| ε (exploration) | 0.1 | Probability of random action |
| Action Space | {0, 50, 100} | Order quantities in units |

### 3. Supply Chain Environment

**Inventory Dynamics:**
```
I(t+1) = I(t) + Arrivals(t) - Sales(t)
Sales(t) = min(Inventory(t), Demand(t))
Lost_Sales(t) = max(0, Demand(t) - Inventory(t))
```

**Reward (Profit) Function:**
```
r(t) = 20·Sales(t) - [OrderCost(a) + 2·Inventory(t) + 10·LostSales(t)]
```

### 4. KPI Metrics (optimizer.py)

```
Service Level    = Total Sold / Total Demand
Inventory Turnover = Total Sold / Average Inventory
Total Lost Sales = Σ max(0, Demand(t) - Inventory(t))
```

---

## 📁 Project Structure

```
Agentic-AI-Supplychain-Optimizer/
│
├── backend/
│   ├── agent.py           # Q-Learning RL agent (ε-greedy, Q-table)
│   ├── app.py             # Flask API server + REST endpoints
│   ├── data_loader.py     # Data cleaning, feature engineering
│   ├── environment.py     # Supply chain simulation environment
│   ├── forecaster.py      # Random Forest demand forecaster
│   ├── main.py            # Entry point / orchestrator
│   └── optimizer.py       # KPI calculation engine
│
├── frontend/
│   ├── index.html         # Dashboard UI
│   ├── script.js          # Real-time chart updates (Chart.js)
│   └── style.css          # Dashboard styling
│
├── data/
│   └── sample_data.csv    # 10,950 rows supply chain dataset
│
├── scripts/
│   └── test_large_dataset.py
│
├── docs/
│   ├── MODULE_ALGORITHMS_EXPLAINED.md
│   └── HOW_TO_TEST_UI.md
│
├── requirements.txt
├── start_server.bat        # Windows launcher
├── start_server.ps1        # PowerShell launcher
└── README.md
```

---

## 🗃️ Dataset

| Property | Details |
|----------|---------|
| Rows | 10,950 (3 years daily data) |
| Columns | 8 |
| Date Range | 2021-01-01 to 2023-12-31 |
| Products | 10 categories (TV, Laptop, Mobile, Tablet, etc.) |
| Features | Date, Product_ID, Product_Name, Demand, Inventory_Level, Lead_Time_Days, Unit_Cost, Unit_Price |

---

## ⚙️ Installation

### Prerequisites
- Python 3.10+
- pip

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/Agentic-AI-Supplychain-Optimizer.git
cd Agentic-AI-Supplychain-Optimizer

# 2. Create virtual environment
python -m venv .venv

# 3. Activate (Windows)
.venv\Scripts\activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Run the Flask server
python backend/app.py
```

### Quick Start (Windows)
```bash
# Double-click or run:
start_server.bat
```

Then open your browser at: **`http://localhost:3000`**

---

## 🖥️ Dashboard — How to Use

1. Open `http://localhost:3000` in your browser
2. Click **"Start Simulation"**
3. Watch the AI agent run through all 10,950 timesteps in real-time:

| Chart | What It Shows |
|-------|--------------|
| 📦 Inventory Level | Stock fluctuations as agent places orders |
| 📊 Demand vs Sales | Forecasted demand vs actual sales |
| 💰 Cumulative Reward | Total profit accumulating over time |

**Live Metrics:**
- ✅ **Service Level** — % of demand fulfilled (~85–95%)
- 💵 **Total Profit** — Cumulative earnings
- ❌ **Stockouts** — Number of unfulfilled demand events (minimized by agent)

---

## 📈 Results

| Metric | Value |
|--------|-------|
| Service Level | ~85–95% |
| Stockouts | Minimized via RL policy |
| Dataset Size | 10,950 simulation steps |
| Agent Type | Tabular Q-Learning (MDP) |
| Forecasting Model | Random Forest (100 trees) |
| Backend | Flask REST API |
| Frontend | Vanilla JS + Chart.js |

---

## 🛠️ Tech Stack

**Backend**
- Python 3.10+, Flask 3.1.2
- Scikit-Learn 1.8.0 (Random Forest)
- Pandas 3.0.0, NumPy 2.3.5
- Custom Q-Learning implementation (no external RL library)

**Frontend**
- HTML5, CSS3, Vanilla JavaScript
- Chart.js (real-time visualization)

**Data**
- Custom synthetic dataset (10,950 rows, 10 product categories)

---

## 🚀 Future Enhancements

- [ ] Deep Q-Network (DQN) with neural function approximation
- [ ] Multi-product simultaneous optimization
- [ ] Stochastic demand with probability distributions
- [ ] Dynamic pricing and price elasticity modeling
- [ ] Cloud deployment (AWS / Azure)
- [ ] LSTM-based demand forecasting

---

## 📚 References

- Watkins, C. J., & Dayan, P. (1992). *Q-learning.* Machine Learning, 8(3-4), 279–292.
- Breiman, L. (2001). *Random forests.* Machine Learning, 45(1), 5–32.
- Silver, E. A., Pyke, D. F., & Peterson, R. (1998). *Inventory Management and Production Planning.*
- Sutton, R. S., & Barto, A. G. (2018). *Reinforcement Learning: An Introduction.* MIT Press.

---

## 👨‍💻 Author

**T. Saravana Kumar**
M.Sc. Data Science | 2026 Passout | CGPA: 8.2 | The American College, Madurai | Madurai Kamaraj University

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?style=flat&logo=linkedin)](https://www.linkedin.com/in/saravana-kumar-88a610396)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-black?style=flat&logo=github)](https://github.com/Saravanakumar210)
[![Email](https://img.shields.io/badge/Email-Contact-red?style=flat&logo=gmail)](mailto:saravanakumar2102003@gmail.com)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
⭐ If this project helped you, please give it a star!
</div>
