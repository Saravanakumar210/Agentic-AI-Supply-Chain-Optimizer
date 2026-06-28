// ============================================
// NEXUS AI - Enterprise Supply Chain Platform
// Premium Frontend Controller
// ============================================

// === Global State ===
let inventoryChart, demandChart, rewardChart;
let simulationInterval;
let stepData = [];
let cumulativeReward = 0;
let cumulativeSold = 0;
let cumulativeLostSales = 0;
let cumulativeDemand = 0;
let currentStep = 0;
let totalSteps = 0;
let isRunning = false;
let maxProfit = 1000;
let maxInventory = 500;
let maxTurnover = 5;

// Sparkline charts
let profitSparkline, serviceSparkline, turnoverSparkline, lossSparkline, utilSparkline;

// === Chart Theme ===
const chartTheme = {
    textColor: '#94a3b8',
    gridColor: 'rgba(255, 255, 255, 0.05)',
    tooltipBg: 'rgba(10, 15, 30, 0.95)',
    tooltipBorder: 'rgba(59, 130, 246, 0.3)',
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    accent: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444'
};

// === Initialize on DOM Load ===
document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    initSparklines();
    initParticles();
    initHubTooltips();
    resetMetricsDisplay();
    updateTimestamp();
    setInterval(updateTimestamp, 1000);
});

// === Animated Background Particles ===
function initParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;

    const particleCount = 50;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = Math.random() * 3 + 1 + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = `rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1})`;
        particle.style.borderRadius = '50%';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animation = `particleFloat ${Math.random() * 20 + 10}s linear infinite`;
        particle.style.animationDelay = Math.random() * 5 + 's';
        particlesContainer.appendChild(particle);
    }
}

// === Hub Tooltips ===
function initHubTooltips() {
    const hubGroups = document.querySelectorAll('.hub-group');
    const tooltip = document.getElementById('hubTooltip');
    
    if (!tooltip) return;

    const regionNames = {
        'na': 'North America',
        'eu': 'Europe',
        'asia': 'Asia Pacific',
        'sa': 'South America',
        'af': 'Africa'
    };

    hubGroups.forEach(hub => {
        hub.addEventListener('mouseenter', (e) => {
            const region = hub.getAttribute('data-region');
            const regionName = regionNames[region] || region;
            
            tooltip.querySelector('.tooltip-region').textContent = regionName;
            tooltip.classList.add('active');
            
            // Position tooltip
            const rect = hub.getBoundingClientRect();
            const containerRect = document.querySelector('.world-map-container').getBoundingClientRect();
            tooltip.style.left = (rect.left - containerRect.left + 20) + 'px';
            tooltip.style.top = (rect.top - containerRect.top - 100) + 'px';
        });

        hub.addEventListener('mouseleave', () => {
            tooltip.classList.remove('active');
        });
    });
}

// === Update Hub Tooltip Data ===
function updateHubTooltip(region, inventory, demand, fulfillment, risk) {
    const tooltip = document.getElementById('hubTooltip');
    if (!tooltip) return;

    document.getElementById('tooltip-inventory').textContent = inventory + ' units';
    document.getElementById('tooltip-demand').textContent = demand + ' units';
    document.getElementById('tooltip-fulfillment').textContent = (fulfillment * 100).toFixed(1) + '%';
    document.getElementById('tooltip-risk').textContent = risk;
}

// === Initialize Main Charts ===
function initCharts() {
    // Inventory Chart
    const invCtx = document.getElementById('inventoryChart')?.getContext('2d');
    if (invCtx) {
        inventoryChart = new Chart(invCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Inventory Level',
                    data: [],
                    borderColor: chartTheme.primary,
                    backgroundColor: createGradient(invCtx, chartTheme.primary),
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    pointBackgroundColor: chartTheme.primary
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: chartTheme.tooltipBg,
                        borderColor: chartTheme.tooltipBorder,
                        borderWidth: 1,
                        padding: 10,
                        titleFont: { family: "'Inter', sans-serif", size: 12, weight: '600' },
                        bodyFont: { family: "'JetBrains Mono', monospace", size: 11 },
                        displayColors: false
                    }
                },
                scales: {
                    x: { 
                        display: false,
                        grid: { display: false }
                    },
                    y: { 
                        beginAtZero: true,
                        grid: { color: chartTheme.gridColor, drawBorder: false },
                        ticks: { 
                            color: chartTheme.textColor, 
                            font: { family: "'JetBrains Mono', monospace", size: 10 },
                            callback: (value) => value + ' units'
                        }
                    }
                },
                animation: {
                    duration: 750,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }

    // Demand Chart
    const demCtx = document.getElementById('demandChart')?.getContext('2d');
    if (demCtx) {
        demandChart = new Chart(demCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Incoming Demand',
                        data: [],
                        backgroundColor: 'rgba(245, 158, 11, 0.6)',
                        borderColor: chartTheme.warning,
                        borderWidth: 1,
                        borderRadius: 4
                    },
                    {
                        label: 'Fulfilled Sales',
                        data: [],
                        backgroundColor: 'rgba(56, 189, 248, 0.6)',
                        borderColor: chartTheme.primary,
                        borderWidth: 1,
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: { 
                            color: chartTheme.textColor, 
                            font: { family: "'Inter', sans-serif", size: 11 },
                            usePointStyle: true,
                            padding: 15
                        }
                    },
                    tooltip: {
                        backgroundColor: chartTheme.tooltipBg,
                        borderColor: chartTheme.tooltipBorder,
                        borderWidth: 1,
                        padding: 10
                    }
                },
                scales: {
                    y: { 
                        beginAtZero: true,
                        grid: { color: chartTheme.gridColor, drawBorder: false },
                        ticks: { 
                            color: chartTheme.textColor, 
                            font: { family: "'JetBrains Mono', monospace", size: 10 },
                            callback: (value) => value + ' units'
                        }
                    },
                    x: { 
                        grid: { color: chartTheme.gridColor },
                        ticks: { color: chartTheme.textColor, font: { size: 10 } }
                    }
                },
                animation: {
                    duration: 750,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }

    // Reward Chart
    const rewCtx = document.getElementById('rewardChart')?.getContext('2d');
    if (rewCtx) {
        rewardChart = new Chart(rewCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Cumulative Profit',
                    data: [],
                    borderColor: chartTheme.accent,
                    backgroundColor: createGradient(rewCtx, chartTheme.accent),
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2.5,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    pointBackgroundColor: chartTheme.accent
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: chartTheme.tooltipBg,
                        borderColor: chartTheme.tooltipBorder,
                        borderWidth: 1,
                        padding: 10,
                        callbacks: {
                            label: (context) => `Profit: $${context.parsed.y.toFixed(0)}`
                        }
                    }
                },
                scales: {
                    x: { 
                        display: false,
                        grid: { display: false }
                    },
                    y: { 
                        beginAtZero: true,
                        grid: { color: chartTheme.gridColor, drawBorder: false },
                        ticks: { 
                            color: chartTheme.textColor, 
                            font: { family: "'JetBrains Mono', monospace", size: 10 },
                            callback: (value) => '$' + value.toFixed(0)
                        }
                    }
                },
                animation: {
                    duration: 750,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }
}

// === Initialize Sparkline Charts ===
function initSparklines() {
    const sparklineConfigs = [
        { id: 'profitSparkline', color: chartTheme.accent },
        { id: 'serviceSparkline', color: chartTheme.primary },
        { id: 'turnoverSparkline', color: chartTheme.secondary },
        { id: 'lossSparkline', color: chartTheme.danger },
        { id: 'utilSparkline', color: chartTheme.primary }
    ];

    sparklineConfigs.forEach(config => {
        const ctx = document.getElementById(config.id)?.getContext('2d');
        if (!ctx) return;

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array(10).fill(''),
                datasets: [{
                    data: Array(10).fill(0),
                    borderColor: config.color,
                    backgroundColor: 'transparent',
                    borderWidth: 1.5,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                scales: {
                    x: { display: false },
                    y: { display: false, beginAtZero: true }
                },
                animation: { duration: 300 }
            }
        });

        if (config.id === 'profitSparkline') profitSparkline = chart;
        else if (config.id === 'serviceSparkline') serviceSparkline = chart;
        else if (config.id === 'turnoverSparkline') turnoverSparkline = chart;
        else if (config.id === 'lossSparkline') lossSparkline = chart;
        else if (config.id === 'utilSparkline') utilSparkline = chart;
    });
}

// === Create Gradient for Charts ===
function createGradient(ctx, color) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, color + '40');
    gradient.addColorStop(1, color + '00');
    return gradient;
}

// === Update Sparkline ===
function updateSparkline(chart, newValue, maxVal) {
    if (!chart) return;
    
    const data = chart.data.datasets[0].data;
    data.shift();
    data.push(newValue);
    
    // Normalize to percentage
    const normalized = maxVal > 0 ? (newValue / maxVal) * 100 : 0;
    chart.data.datasets[0].data = data.map(v => maxVal > 0 ? (v / maxVal) * 100 : 0);
    
    chart.update('none');
}

// === Update Timestamp ===
function updateTimestamp() {
    const timestampEl = document.getElementById('timestamp');
    if (timestampEl) {
        const now = new Date();
        timestampEl.textContent = now.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });
    }
}

// === Update Risk Meter ===
function updateRiskMeter(riskScore) {
    const riskArc = document.getElementById('risk-arc');
    const riskNumber = document.getElementById('risk-score');
    
    if (riskArc) {
        // Risk score 0-100, arc length 251
        const offset = 251 - (riskScore / 100) * 251;
        riskArc.style.strokeDashoffset = offset;
        
        // Color based on risk
        if (riskScore < 30) {
            riskNumber.style.color = chartTheme.accent;
            riskNumber.style.textShadow = '0 0 10px rgba(16, 185, 129, 0.5)';
        } else if (riskScore < 60) {
            riskNumber.style.color = chartTheme.warning;
            riskNumber.style.textShadow = '0 0 10px rgba(245, 158, 11, 0.5)';
        } else {
            riskNumber.style.color = chartTheme.danger;
            riskNumber.style.textShadow = '0 0 10px rgba(239, 68, 68, 0.5)';
        }
    }
    
    if (riskNumber) {
        riskNumber.textContent = riskScore.toFixed(0);
    }
}

// === Update Capacity Gauge ===
function updateCapacityGauge(percent) {
    const capacityCircle = document.getElementById('capacity-circle');
    const capacityPercent = document.getElementById('capacity-percent');
    
    if (capacityCircle) {
        // Circle circumference = 314
        const offset = 314 - (percent / 100) * 314;
        capacityCircle.style.strokeDashoffset = offset;
    }
    
    if (capacityPercent) {
        capacityPercent.textContent = percent.toFixed(0) + '%';
    }
}

// === Update Heatmap ===
function updateHeatmap(region, score) {
    const heatmapEl = document.getElementById(`heat-${region}`);
    if (!heatmapEl) return;
    
    heatmapEl.textContent = score.toFixed(0) + '%';
    heatmapEl.className = 'region-score ' + (score >= 90 ? 'optimal' : score >= 75 ? 'warning' : 'critical');
}

// === Update Comparison Table ===
function updateComparisonTable(region, inventory, demand, serviceLevel) {
    const invEl = document.getElementById(`table-${region}-inv`);
    const demEl = document.getElementById(`table-${region}-dem`);
    const servEl = document.getElementById(`table-${region}-serv`);
    
    if (invEl) invEl.textContent = inventory;
    if (demEl) demEl.textContent = demand;
    if (servEl) servEl.textContent = (serviceLevel * 100).toFixed(1) + '%';
}

// === Update Optimization Score ===
function updateOptimizationScore(score) {
    const scoreEl = document.getElementById('opt-score');
    if (scoreEl) {
        scoreEl.textContent = score.toFixed(0) + '%';
    }
}

// === Update Confidence Score ===
function updateConfidenceScore(confidence) {
    const confidenceBar = document.getElementById('confidence-bar');
    const confidenceValue = document.getElementById('confidence-value');
    
    if (confidenceBar) {
        confidenceBar.style.width = (confidence * 100) + '%';
    }
    if (confidenceValue) {
        confidenceValue.textContent = (confidence * 100).toFixed(0) + '%';
    }
}

// === Update Learning Progress ===
function updateLearningProgress(progress) {
    const progressPath = document.getElementById('learning-progress');
    const progressText = document.getElementById('learning-text');
    
    if (progressPath) {
        progressPath.setAttribute('stroke-dasharray', `${progress}, 100`);
    }
    if (progressText) {
        progressText.textContent = progress.toFixed(0) + '%';
    }
}

// === Update Region Markers ===
function updateRegionMarkers() {
    const groups = document.querySelectorAll('.hub-group');
    groups.forEach((group, idx) => {
        const marker = group.querySelector('.region-marker');
        const optimalRing = group.querySelector('.ring-optimal');
        const warningRing = group.querySelector('.ring-warning');
        const criticalRing = group.querySelector('.ring-critical');
        
        if (!marker || !optimalRing || !warningRing || !criticalRing) return;

        const seed = (currentStep * (idx + 1)) % 3;
        
        if (seed === 0) {
            marker.className.baseVal = 'region-marker optimal';
            optimalRing.setAttribute('stroke-dasharray', '60 88');
            optimalRing.setAttribute('stroke-dashoffset', '0');
            warningRing.setAttribute('stroke-dasharray', '20 88');
            warningRing.setAttribute('stroke-dashoffset', '-60');
            criticalRing.setAttribute('stroke-dasharray', '8 88');
            criticalRing.setAttribute('stroke-dashoffset', '-80');
        } else if (seed === 1) {
            marker.className.baseVal = 'region-marker warning';
            optimalRing.setAttribute('stroke-dasharray', '15 88');
            optimalRing.setAttribute('stroke-dashoffset', '0');
            warningRing.setAttribute('stroke-dasharray', '55 88');
            warningRing.setAttribute('stroke-dashoffset', '-15');
            criticalRing.setAttribute('stroke-dasharray', '18 88');
            criticalRing.setAttribute('stroke-dashoffset', '-70');
        } else {
            marker.className.baseVal = 'region-marker critical';
            optimalRing.setAttribute('stroke-dasharray', '10 88');
            optimalRing.setAttribute('stroke-dashoffset', '0');
            warningRing.setAttribute('stroke-dasharray', '18 88');
            warningRing.setAttribute('stroke-dashoffset', '-10');
            criticalRing.setAttribute('stroke-dasharray', '60 88');
            criticalRing.setAttribute('stroke-dashoffset', '-28');
        }
    });
}

// === Terminal Logging ===
function writeTerminalLine(text, type = '') {
    const terminal = document.getElementById('agentTerminal');
    if (!terminal) return;

    const line = document.createElement('div');
    line.className = 'terminal-line ' + type;
    line.textContent = text;
    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;
}

// === Decision Narrative ===
function updateDecisionNarrative(data) {
    const narrative = document.getElementById('decisionNarrative');
    if (!narrative) return;

    let text = "";
    if (data.inventory < 20) {
        text = `⚠️ <b>Critical Stock Warning:</b> Current warehouse inventory is extremely low (${data.inventory} units). The AI is learning that holding actions (0) here leads to heavy stockout penalties (-$10/unit). It will likely prioritize aggressive replenishment (100) next.`;
    } else if (data.inventory > 100) {
        text = `📦 <b>Overstock Warning:</b> Current warehouse inventory is high (${data.inventory} units). The AI is penalizing holding costs (-$2.00/unit/day). To maximize net profits, the policy should hold off on placing orders (Action: 0).`;
    } else {
        text = `🌱 <b>Optimal Balance:</b> Inventory is steady at ${data.inventory} units. The agent is successfully balancing ordering costs vs. stockout risks. This state produces the highest reward efficiency.`;
    }

    narrative.innerHTML = text;
}

// === Reset Metrics Display ===
function resetMetricsDisplay() {
    const elements = {
        'total-profit-value': '$0',
        'service-level-value': '0%',
        'total-lost-sales-value': '0',
        'avg-inventory-value': '0',
        'inventory-turnover-value': '0',
        'warehouse-util-value': '0%',
        'current-inventory-value': '0 units',
        'current-demand-value': '0 units',
        'action-taken-value': '0',
        'step-reward-value': '$0'
    };

    Object.entries(elements).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.innerText = value;
    });

    const agentStatus = document.getElementById('agent-status');
    if (agentStatus) {
        agentStatus.innerText = 'Stable';
        agentStatus.className = 'intel-value healthy';
    }

    const recommendedAction = document.getElementById('recommended-action');
    if (recommendedAction) {
        recommendedAction.innerText = 'Hold Orders';
    }

    const confidenceValue = document.getElementById('confidence-value');
    const confidenceBar = document.getElementById('confidence-bar');
    if (confidenceValue) confidenceValue.innerText = '0%';
    if (confidenceBar) confidenceBar.style.width = '0%';

    const learningText = document.getElementById('learning-text');
    const learningProgress = document.getElementById('learning-progress');
    if (learningText) learningText.innerText = '0%';
    if (learningProgress) learningProgress.setAttribute('stroke-dasharray', '0, 100');

    const narrative = document.getElementById('decisionNarrative');
    if (narrative) {
        narrative.innerText = "The agent will formulate its supply strategy based on rewards. Cumulative balance values are calculated instantly to optimize local inventory carrying and stockout costs.";
    }

    // Reset executive insights
    const efficiencyEl = document.getElementById('efficiency-index');
    const fulfillmentEl = document.getElementById('fulfillment-score');
    const forecastEl = document.getElementById('forecast-accuracy');
    const healthEl = document.getElementById('inventory-health');
    if (efficiencyEl) efficiencyEl.innerText = '0%';
    if (fulfillmentEl) fulfillmentEl.innerText = '0%';
    if (forecastEl) forecastEl.innerText = '0%';
    if (healthEl) {
        healthEl.innerText = 'Stable';
        healthEl.className = 'insight-value';
    }

    // Reset gauges
    updateRiskMeter(0);
    updateCapacityGauge(0);
    updateConfidenceWidget(0);
    updateOptimizationScore(0);
}

// === Update KPI Bars ===
function updateKPIBars(metrics) {
    const profitBar = document.getElementById('profit-bar');
    const serviceBar = document.getElementById('service-bar');
    const invBar = document.getElementById('turnover-bar');
    const turnoverBar = document.getElementById('turnover-bar');
    const lossBar = document.getElementById('loss-bar');
    const utilBar = document.getElementById('util-bar');

    if (profitBar) profitBar.style.width = Math.min((cumulativeReward / maxProfit) * 100, 100) + '%';
    if (serviceBar) serviceBar.style.width = (metrics.serviceLevel * 100) + '%';
    if (invBar) invBar.style.width = Math.min((metrics.avgInventory / maxInventory) * 100, 100) + '%';
    if (turnoverBar) turnoverBar.style.width = Math.min((metrics.turnover / maxTurnover) * 100, 100) + '%';
    if (lossBar) lossBar.style.width = Math.min((metrics.lostSales / 50) * 100, 100) + '%';
    if (utilBar) utilBar.style.width = Math.min((metrics.avgInventory / maxInventory) * 100, 100) + '%';
}

// === Main Dashboard Update ===
function updateDashboard(data) {
    const label = `${data.step}`;

    cumulativeSold += data.sold;
    cumulativeLostSales += data.lost_sales;
    cumulativeDemand += data.demand;

    // Update charts
    if (inventoryChart) {
        inventoryChart.data.labels.push(label);
        inventoryChart.data.datasets[0].data.push(data.inventory);
        if (inventoryChart.data.labels.length > 80) {
            inventoryChart.data.labels.shift();
            inventoryChart.data.datasets[0].data.shift();
        }
        inventoryChart.update('none');
    }

    if (demandChart) {
        demandChart.data.labels.push(label);
        demandChart.data.datasets[0].data.push(data.demand);
        demandChart.data.datasets[1].data.push(data.sold);
        if (demandChart.data.labels.length > 80) {
            demandChart.data.labels.shift();
            demandChart.data.datasets[0].data.shift();
            demandChart.data.datasets[1].data.shift();
        }
        demandChart.update('none');
    }

    if (rewardChart) {
        rewardChart.data.labels.push(label);
        cumulativeReward += data.reward;
        rewardChart.data.datasets[0].data.push(cumulativeReward);
        if (rewardChart.data.labels.length > 80) {
            rewardChart.data.labels.shift();
            rewardChart.data.datasets[0].data.shift();
        }
        rewardChart.update('none');
    }

    // Update KPI values
    const totalProfitEl = document.getElementById('total-profit-value');
    const totalLostSalesEl = document.getElementById('total-lost-sales-value');
    const currentInventoryEl = document.getElementById('current-inventory-value');
    const currentDemandEl = document.getElementById('current-demand-value');
    const actionTakenEl = document.getElementById('action-taken-value');
    const stepRewardEl = document.getElementById('step-reward-value');
    const serviceLevelEl = document.getElementById('service-level-value');
    const inventoryTurnoverEl = document.getElementById('inventory-turnover-value');
    const warehouseUtilEl = document.getElementById('warehouse-util-value');

    if (totalProfitEl) totalProfitEl.innerText = `$${cumulativeReward.toFixed(0)}`;
    if (totalLostSalesEl) totalLostSalesEl.innerText = cumulativeLostSales;
    if (currentInventoryEl) currentInventoryEl.innerText = data.inventory + ' units';
    if (currentDemandEl) currentDemandEl.innerText = data.demand + ' units';
    
    const actionText = String(data.action);
    const actionSpan = `<span style="background:rgba(245,158,11,0.2);color:#f59e0b;padding:3px 8px;border-radius:4px;font-weight:700;border:1px solid rgba(245,158,11,0.3);">${actionText}</span>`;
    if (actionTakenEl) actionTakenEl.innerHTML = actionSpan;
    if (stepRewardEl) stepRewardEl.innerText = `${data.reward >= 0 ? '+' : ''}$${data.reward.toFixed(0)}`;

    // Service level
    let serviceLevel = 0;
    if (cumulativeDemand > 0) {
        serviceLevel = cumulativeSold / cumulativeDemand;
        if (serviceLevelEl) serviceLevelEl.innerText = `${(serviceLevel * 100).toFixed(1)}%`;
    } else {
        if (serviceLevelEl) serviceLevelEl.innerText = '0%';
    }

    // Inventory turnover
    const avgInventory = data.inventory;
    const turnover = cumulativeSold > 0 ? cumulativeSold / (avgInventory || 1) : 0;
    if (inventoryTurnoverEl) inventoryTurnoverEl.innerText = turnover.toFixed(2);

    // Warehouse utilization
    const utilization = (avgInventory / maxInventory) * 100;
    if (warehouseUtilEl) warehouseUtilEl.innerText = utilization.toFixed(0) + '%';

    // Metrics object
    const metrics = {
        serviceLevel: serviceLevel,
        avgInventory: avgInventory,
        turnover: turnover,
        lostSales: cumulativeLostSales
    };

    // Update UI components
    updateKPIBars(metrics);
    updateRegionMarkers();
    updateDecisionNarrative(data);
    updateSparklines(metrics);
    updateEnterpriseWidgets(data, metrics);
    updateConfidenceScore(Math.min(0.5 + (currentStep / totalSteps) * 0.5, 1));
    updateLearningProgress(totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0);
    updateOptimizationScore(Math.min(serviceLevel * 100, 100));

    // Agent status
    const agentStatus = data.reward > 0 ? 'Optimal' : data.reward < -15 ? 'Critical' : 'Stable';
    const statusClass = data.reward > 0 ? 'healthy' : data.reward < -15 ? 'critical' : 'warning';
    const agentStatusEl = document.getElementById('agent-status');
    if (agentStatusEl) {
        agentStatusEl.innerText = agentStatus;
        agentStatusEl.className = 'intel-value ' + statusClass;
    }

    // Recommended action
    const recommendedAction = data.inventory < 30 ? 'Order 100 Units' : data.inventory > 100 ? 'Hold Orders' : 'Order 50 Units';
    const recommendedActionEl = document.getElementById('recommended-action');
    if (recommendedActionEl) recommendedActionEl.innerText = recommendedAction;

    // Terminal logging
    const actionDescriptions = {
        0: "HOLD ORDERS (avoids extra carrying costs)",
        50: "ORDER 50 UNITS (replenishes standard capacity)",
        100: "ORDER 100 UNITS (replenishes maximum capacity)"
    };
    
    writeTerminalLine(`[STEP ${data.step}] State: Inventory=${data.inventory} | Demand=${data.demand}`, "system-msg");
    if (data.lost_sales > 0) {
        writeTerminalLine(`  └─ ALERT: Lost ${data.lost_sales} units of customer sales. Understocked!`, "alert-msg");
    }
    writeTerminalLine(`  └─ DECISION: Action chosen => ${data.action} | ${actionDescriptions[data.action]}`, "user-action");
    
    const stepSign = data.reward >= 0 ? '+' : '-';
    const stepClass = data.reward >= 0 ? 'success-msg' : 'alert-msg';
    writeTerminalLine(`  └─ REWARD: Step profit margin is ${stepSign}$${Math.abs(data.reward).toFixed(1)}`, stepClass);
}

// === Update Sparklines ===
function updateSparklines(metrics) {
    updateSparkline(profitSparkline, cumulativeReward, maxProfit);
    updateSparkline(serviceSparkline, metrics.serviceLevel * 100, 100);
    updateSparkline(turnoverSparkline, metrics.turnover * 100, maxTurnover * 100);
    updateSparkline(lossSparkline, cumulativeLostSales, 50);
    updateSparkline(utilSparkline, metrics.avgInventory, maxInventory);
}

// === Update Enterprise Widgets ===
function updateEnterpriseWidgets(data, metrics) {
    // Risk meter (based on lost sales and inventory levels)
    const riskScore = Math.min((cumulativeLostSales / 50) * 50 + (data.inventory < 30 ? 30 : data.inventory > 150 ? 20 : 0), 100);
    updateRiskMeter(riskScore);

    // Capacity gauge
    const capacity = (data.inventory / maxInventory) * 100;
    updateCapacityGauge(capacity);

    // AI Confidence widget
    const confidence = Math.min(0.5 + (currentStep / totalSteps) * 0.5, 1);
    updateConfidenceWidget(confidence);

    // Executive Insights
    updateExecutiveInsights(data, metrics);

    // Heatmap (simulate regional data)
    updateHeatmap('na', 90 + Math.random() * 10);
    updateHeatmap('eu', 85 + Math.random() * 10);
    updateHeatmap('as', 75 + Math.random() * 15);
    updateHeatmap('sa', 80 + Math.random() * 15);
    updateHeatmap('af', 70 + Math.random() * 20);

    // Comparison table
    updateComparisonTable('na', data.inventory, data.demand, metrics.serviceLevel);
    updateComparisonTable('eu', data.inventory * 0.9, data.demand * 0.95, metrics.serviceLevel * 1.05);
    updateComparisonTable('as', data.inventory * 1.1, data.demand * 1.2, metrics.serviceLevel * 0.95);
    updateComparisonTable('sa', data.inventory * 0.8, data.demand * 0.85, metrics.serviceLevel * 1.02);
    updateComparisonTable('af', data.inventory * 1.2, data.demand * 1.1, metrics.serviceLevel * 0.9);
}

// === Update AI Confidence Widget ===
function updateConfidenceWidget(confidence) {
    const confidenceCircle = document.getElementById('confidence-circle');
    const confidencePercent = document.getElementById('confidence-percent');
    
    if (confidenceCircle) {
        const offset = 314 - (confidence * 100) * 3.14;
        confidenceCircle.style.strokeDashoffset = offset;
    }
    
    if (confidencePercent) {
        confidencePercent.textContent = (confidence * 100).toFixed(0) + '%';
    }
}

// === Update Executive Insights ===
function updateExecutiveInsights(data, metrics) {
    const efficiencyIndex = metrics.serviceLevel * 100;
    const fulfillmentScore = metrics.serviceLevel * 100;
    const forecastAccuracy = 75 + Math.random() * 20;
    const inventoryHealth = data.inventory < 30 ? 'Critical' : data.inventory > 100 ? 'Overstocked' : 'Healthy';

    const efficiencyEl = document.getElementById('efficiency-index');
    const fulfillmentEl = document.getElementById('fulfillment-score');
    const forecastEl = document.getElementById('forecast-accuracy');
    const healthEl = document.getElementById('inventory-health');

    if (efficiencyEl) efficiencyEl.innerText = efficiencyIndex.toFixed(0) + '%';
    if (fulfillmentEl) fulfillmentEl.innerText = fulfillmentScore.toFixed(0) + '%';
    if (forecastEl) forecastEl.innerText = forecastAccuracy.toFixed(0) + '%';
    if (healthEl) {
        healthEl.innerText = inventoryHealth;
        healthEl.className = 'insight-value ' + (inventoryHealth === 'Healthy' ? 'healthy' : inventoryHealth === 'Critical' ? 'critical' : 'warning');
    }
}

// === Simulation Control Functions ===
async function startSimulation() {
    const statusEl = document.getElementById('status');
    const progressEl = document.getElementById('progress');
    
    writeTerminalLine('[NEXUS] Initializing simulation environment...', 'system-msg');
    if (statusEl) statusEl.innerText = 'Initializing...';

    try {
        const response = await fetch('/api/start_simulation', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.status === "Simulation Started") {
            totalSteps = data.steps || 0;
            currentStep = 0;
            cumulativeReward = 0;
            cumulativeSold = 0;
            cumulativeLostSales = 0;
            cumulativeDemand = 0;
            stepData = [];

            // Reset charts
            if (inventoryChart) {
                inventoryChart.data.labels = [];
                inventoryChart.data.datasets[0].data = [];
                inventoryChart.update();
            }
            if (demandChart) {
                demandChart.data.labels = [];
                demandChart.data.datasets[0].data = [];
                demandChart.data.datasets[1].data = [];
                demandChart.update();
            }
            if (rewardChart) {
                rewardChart.data.labels = [];
                rewardChart.data.datasets[0].data = [];
                rewardChart.update();
            }

            resetMetricsDisplay();
            if (progressEl) progressEl.innerText = `0 / ${totalSteps}`;
            if (statusEl) statusEl.innerText = 'Active';
            
            writeTerminalLine(`[NEXUS] Loaded Dataset Successfully.`, 'success-msg');
            writeTerminalLine(`[NEXUS] Simulation Initialized: ${totalSteps} steps total.`, 'success-msg');
            writeTerminalLine(`[NEXUS] Action Space Set: [0, 50, 100]. Awaiting step triggers.`, 'system-msg');
            updateRegionMarkers();
        } else {
            throw new Error(data.error || 'Failed to start simulation');
        }
    } catch (e) {
        console.error('Start simulation error:', e);
        if (statusEl) statusEl.innerText = 'Error';
        writeTerminalLine(`[ERROR] Failed to start simulation: ${e.message}`, 'alert-msg');
    }
}

async function runStep() {
    if (isRunning) return;

    const statusEl = document.getElementById('status');
    const progressEl = document.getElementById('progress');

    try {
        writeTerminalLine('[NEXUS] Executing simulation step...', 'system-msg');
        
        const response = await fetch('/api/step', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const res = await response.json();

        if (res.data) {
            currentStep++;
            updateDashboard(res.data);
            if (progressEl) progressEl.innerText = `${currentStep} / ${totalSteps}`;
            writeTerminalLine(`[NEXUS] Step ${currentStep} completed successfully.`, 'success-msg');
        }

        if (res.done) {
            if (statusEl) statusEl.innerText = 'Completed';
            writeTerminalLine("[NEXUS] End of dataset reached. Simulation complete.", "success-msg");
            isRunning = false;
        }
    } catch (e) {
        console.error('Run step error:', e);
        if (statusEl) statusEl.innerText = 'Error';
        writeTerminalLine(`[ERROR] Step processing failed: ${e.message}`, 'alert-msg');
        isRunning = false;
    }
}

async function runAllSteps() {
    const runBtn = document.getElementById('run-btn-text');
    const statusEl = document.getElementById('status');
    
    if (isRunning) {
        isRunning = false;
        if (statusEl) statusEl.innerText = 'Paused';
        if (runBtn) runBtn.innerText = 'Resume Auto-Run';
        writeTerminalLine(">> Simulation paused by user.", "system-msg");
        return;
    }

    isRunning = true;
    if (statusEl) statusEl.innerText = 'Running';
    if (runBtn) runBtn.innerText = 'Pause Auto-Run';
    writeTerminalLine(">> Simulation running automatically...", "system-msg");

    async function runNextStep() {
        if (!isRunning) return;

        try {
            const response = await fetch('/api/step', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const res = await response.json();

            if (res.data) {
                currentStep++;
                updateDashboard(res.data);
                const progressEl = document.getElementById('progress');
                if (progressEl) progressEl.innerText = `${currentStep} / ${totalSteps}`;
            }

            if (!res.done && isRunning) {
                setTimeout(runNextStep, 50);
            } else {
                if (statusEl) statusEl.innerText = 'Completed';
                isRunning = false;
                if (runBtn) runBtn.innerText = 'Auto-Run Agent';
                writeTerminalLine("[NEXUS] Simulation auto-run completed successfully.", "success-msg");
            }
        } catch (e) {
            console.error('Auto-run error:', e);
            if (statusEl) statusEl.innerText = 'Error';
            writeTerminalLine(`[ERROR] Simulation auto-run crashed: ${e.message}`, 'alert-msg');
            isRunning = false;
            if (runBtn) runBtn.innerText = 'Auto-Run Agent';
        }
    }

    runNextStep();
}

async function getResults() {
    const statusEl = document.getElementById('status');
    
    try {
        writeTerminalLine("[NEXUS] Fetching final analytical optimization matrix...", "system-msg");
        const response = await fetch('/api/results', { method: 'GET' });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.metrics) {
            const metrics = data.metrics;
            const serviceLevelEl = document.getElementById('service-level-value');
            const totalLostSalesEl = document.getElementById('total-lost-sales-value');
            const avgInventoryEl = document.getElementById('avg-inventory-value');
            const inventoryTurnoverEl = document.getElementById('inventory-turnover-value');
            const totalProfitEl = document.getElementById('total-profit-value');

            if (serviceLevelEl) serviceLevelEl.innerText = `${(metrics.service_level * 100).toFixed(1)}%`;
            if (totalLostSalesEl) totalLostSalesEl.innerText = metrics.total_lost_sales || 0;
            if (avgInventoryEl) avgInventoryEl.innerText = metrics.avg_inventory.toFixed(0);
            if (inventoryTurnoverEl) inventoryTurnoverEl.innerText = metrics.inventory_turnover.toFixed(2);
            if (totalProfitEl) totalProfitEl.innerText = `$${cumulativeReward.toFixed(0)}`;

            if (statusEl) statusEl.innerText = 'Completed';

            writeTerminalLine(">> Optimizer metrics loaded:", "success-msg");
            writeTerminalLine(`   • Final Service Level: ${(metrics.service_level * 100).toFixed(1)}%`, "success-msg");
            writeTerminalLine(`   • Total Unfulfilled Units: ${metrics.total_lost_sales}`, "success-msg");
            writeTerminalLine(`   • Average Inventory: ${metrics.avg_inventory.toFixed(0)} units`, "success-msg");
            writeTerminalLine(`   • Turnover Rate: ${metrics.inventory_turnover.toFixed(2)}x`, "success-msg");
        }
    } catch (e) {
        console.error('Get results error:', e);
        if (statusEl) statusEl.innerText = 'Error';
        writeTerminalLine(`[ERROR] Failed to compile results: ${e.message}`, "alert-msg");
    }
}

function resetSimulation() {
    const statusEl = document.getElementById('status');
    const progressEl = document.getElementById('progress');
    const runBtn = document.getElementById('run-btn-text');
    
    isRunning = false;
    currentStep = 0;
    totalSteps = 0;
    cumulativeSold = 0;
    cumulativeLostSales = 0;
    cumulativeDemand = 0;
    cumulativeReward = 0;

    if (statusEl) statusEl.innerText = 'Ready';
    if (progressEl) progressEl.innerText = '0 / 0';
    if (runBtn) runBtn.innerText = 'Auto-Run Agent';

    // Reset charts
    if (inventoryChart) {
        inventoryChart.data.labels = [];
        inventoryChart.data.datasets[0].data = [];
        inventoryChart.update();
    }
    if (demandChart) {
        demandChart.data.labels = [];
        demandChart.data.datasets[0].data = [];
        demandChart.data.datasets[1].data = [];
        demandChart.update();
    }
    if (rewardChart) {
        rewardChart.data.labels = [];
        rewardChart.data.datasets[0].data = [];
        rewardChart.update();
    }

    resetMetricsDisplay();

    const terminal = document.getElementById('agentTerminal');
    if (terminal) terminal.innerHTML = "";
    writeTerminalLine("[NEXUS] System reset completed. Simulation state cleared.", "system-msg");
}