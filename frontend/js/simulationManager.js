
// --- UI State Management and Globals ---

let simulationState = {
    currentStep: 0,
    totalSteps: 0,
    cumulativeReward: 0,
    cumulativeDemand: 0,
    cumulativeSold: 0,
    cumulativeLostSales: 0,
    isSimulationRunning: false,
    simulationSpeed: 50, // milliseconds delay for auto-run
    settings: {
        holdingCost: 0.50,
        stockoutPenalty: 10.00,
        orderLeadTime: 2,
        initialInventory: 100,
        simulationSteps: 200
    }
};

let historyData = [];

// DOM Elements Cache
const DOM_ELEMENTS = {
    sidebar: document.querySelector('.sidebar-navigation'),
    openSettingsBtn: document.getElementById('open-settings-btn'),
    closeSettingsBtn: document.getElementById('close-settings-btn'),
    settingsPanel: document.getElementById('settings-panel'),
    // KPI Cards
    kpiProfit: document.getElementById('total-profit-value'),
    kpiServiceLevel: document.getElementById('service-level-value'),
    kpiAvgInventory: document.getElementById('avg-inventory-value'),
    kpiTurnover: document.getElementById('inventory-turnover-value'),
    kpiLostSales: document.getElementById('total-lost-sales-value'),
    // Status indicators
    statusIndicator: document.getElementById('status'),
    progressIndicator: document.getElementById('progress'),
    runBtnText: document.getElementById('run-btn-text'),
    // Agent Terminal
    agentTerminal: document.getElementById('agentTerminal'),
    decisionNarrative: document.getElementById('decisionNarrative'),
    // Map elements
    worldMapContainer: document.querySelector('.world-map-container'),
    hubMarkers: document.querySelectorAll('.hub-group'),
    // Gauge elements (assuming IDs)
    serviceLevelGauge: document.getElementById('service-level-gauge'),
    inventoryUtilGauge: document.getElementById('inventory-utilization-gauge'),
    supplyChainEffGauge: document.getElementById('supply-chain-efficiency-gauge'),
    // Settings Panel Inputs
    holdingCostInput: document.getElementById('holding-cost'),
    stockoutPenaltyInput: document.getElementById('stockout-penalty'),
    orderLeadTimeInput: document.getElementById('order-lead-time'),
    initialInventoryInput: document.getElementById('initial-inventory'),
    simulationStepsInput: document.getElementById('simulation-steps'),
    applySettingsBtn: document.getElementById('apply-settings-btn'),
    resetDefaultsBtn: document.getElementById('reset-defaults-btn'),
    simulationSpeedSlider: document.getElementById('simulation-speed') // Add slider in HTML
};

// --- Utility Functions ---

function writeTerminalLine(text, type = '') {
    if (!DOM_ELEMENTS.agentTerminal) return;
    const line = document.createElement('div');
    line.className = `terminal-line ${type}`;
    line.innerHTML = text; // Use innerHTML to allow for styled spans
    DOM_ELEMENTS.agentTerminal.appendChild(line);
    DOM_ELEMENTS.agentTerminal.scrollTop = DOM_ELEMENTS.agentTerminal.scrollHeight; // Auto-scroll
}

function updateDecisionNarrative(data) {
    if (!DOM_ELEMENTS.decisionNarrative) return;
    let text = "";
    const inventory = data.inventory;
    const reward = data.reward;
    const action = data.action;

    // Basic narrative logic based on current state
    if (inventory < 30) {
        text = `⚠️ <b>Critical Stock Alert:</b> Inventory low (${inventory} units). Agent likely prioritizing replenishment. High potential for stockout penalties.`;
    } else if (inventory > 150) {
        text = `📦 <b>Overstock Warning:</b> Inventory high (${inventory} units). Agent may be reducing orders to minimize holding costs.`;
    } else {
        text = `✅ <b>Optimal Balance:</b> Inventory stable (${inventory} units). Agent is managing costs effectively.`;
    }

    if (reward < -10) {
        text += ` Recent reward was significantly negative (${reward.toFixed(1)}), indicating costly decisions or external factors.`;
    } else if (reward > 5) {
         text += ` Positive reward (${reward.toFixed(1)}) suggests efficient decision-making.`;
    }

    DOM_ELEMENTS.decisionNarrative.innerHTML = text;
}

function updateStatusIndicators(status, progress = '0 / 0') {
    if (DOM_ELEMENTS.statusIndicator) DOM_ELEMENTS.statusIndicator.innerText = status;
    if (DOM_ELEMENTS.progressIndicator) DOM_ELEMENTS.progressIndicator.innerText = progress;
}

function updateRunButtonText(isRunning) {
    if (DOM_ELEMENTS.runBtnText) {
        DOM_ELEMENTS.runBtnText.innerText = isRunning ? 'Pause Auto-Run' : 'Auto-Run Agent';
    }
}

// --- Settings Panel Logic ---

function toggleSettingsPanel() {
    DOM_ELEMENTS.settingsPanel.classList.toggle('active');
}

function updateSettingsDisplay() {
    if (DOM_ELEMENTS.holdingCostInput) DOM_ELEMENTS.holdingCostInput.value = simulationState.settings.holdingCost;
    if (DOM_ELEMENTS.stockoutPenaltyInput) DOM_ELEMENTS.stockoutPenaltyInput.value = simulationState.settings.stockoutPenalty;
    if (DOM_ELEMENTS.orderLeadTimeInput) DOM_ELEMENTS.orderLeadTimeInput.value = simulationState.settings.orderLeadTime;
    if (DOM_ELEMENTS.initialInventoryInput) DOM_ELEMENTS.initialInventoryInput.value = simulationState.settings.initialInventory;
    if (DOM_ELEMENTS.simulationStepsInput) DOM_ELEMENTS.simulationStepsInput.value = simulationState.settings.simulationSteps;
    
    // Update displayed values next to sliders
    updateSettingValueDisplay('holding-cost');
    updateSettingValueDisplay('stockout-penalty');
    updateSettingValueDisplay('order-lead-time');
}

function updateSettingValueDisplay(id) {
    const input = document.getElementById(id);
    const display = document.getElementById(`${id}-value`);
    if (input && display) {
        display.textContent = input.value;
    }
}

function applySettings() {
    simulationState.settings.holdingCost = parseFloat(DOM_ELEMENTS.holdingCostInput.value);
    simulationState.settings.stockoutPenalty = parseFloat(DOM_ELEMENTS.stockoutPenaltyInput.value);
    simulationState.settings.orderLeadTime = parseInt(DOM_ELEMENTS.orderLeadTimeInput.value, 10);
    simulationState.settings.initialInventory = parseInt(DOM_ELEMENTS.initialInventoryInput.value, 10);
    simulationState.settings.simulationSteps = parseInt(DOM_ELEMENTS.simulationStepsInput.value, 10);
    
    // TODO: Send these settings to the backend if the API supports it
    // For now, we update the local state and UI display
    console.log("Settings applied:", simulationState.settings);
    alert("Settings updated locally. Please re-initialize the simulation for changes to take effect.");
    
    toggleSettingsPanel(); // Close panel after applying
}

function resetSettingsToDefaults() {
    simulationState.settings = {
        holdingCost: 0.50,
        stockoutPenalty: 10.00,
        orderLeadTime: 2,
        initialInventory: 100,
        simulationSteps: 200
    };
    updateSettingsDisplay(); // Update the input fields
    alert("Settings reset to defaults. Please re-initialize the simulation.");
}

// --- KPI Card Updates ---

function updateKPICards(data, metrics) {
    if (DOM_ELEMENTS.kpiProfit) DOM_ELEMENTS.kpiProfit.innerText = `$${simulationState.cumulativeReward.toFixed(0)}`;
    if (DOM_ELEMENTS.kpiServiceLevel) DOM_ELEMENTS.kpiServiceLevel.innerText = metrics.serviceLevel ? `${(metrics.serviceLevel * 100).toFixed(1)}%` : '0%';
    if (DOM_ELEMENTS.kpiAvgInventory) DOM_ELEMENTS.kpiAvgInventory.innerText = data.inventory !== undefined ? `${data.inventory} units` : '0';
    if (DOM_ELEMENTS.kpiTurnover) DOM_ELEMENTS.kpiTurnover.innerText = metrics.turnover ? metrics.turnover.toFixed(2) : '0.00';
    if (DOM_ELEMENTS.kpiLostSales) DOM_ELEMENTS.kpiLostSales.innerText = metrics.lostSales !== undefined ? `${metrics.lostSales}` : '0';

    // TODO: Add trend percentages and sparkline updates if data is available
}

// --- Gauge Updates ---

function updateGauges(metrics) {
    // Placeholder: Implement gauge updates using a library or custom SVG animation
    // Example for Service Level Gauge:
    if (DOM_ELEMENTS.serviceLevelGauge && metrics.serviceLevel) {
        // Assuming gauge is a custom SVG element or uses a library
        // e.g., updateGaugeValue(DOM_ELEMENTS.serviceLevelGauge, metrics.serviceLevel * 100);
        console.log("Updating Service Level Gauge to:", metrics.serviceLevel * 100);
    }
     if (DOM_ELEMENTS.inventoryUtilGauge && metrics.avgInventory) {
        // Normalize inventory utilization based on max capacity if known
        console.log("Updating Inventory Utilization Gauge to:", metrics.avgInventory);
    }
     if (DOM_ELEMENTS.supplyChainEffGauge && metrics.efficiency) { // Assuming efficiency metric exists
        console.log("Updating Supply Chain Efficiency Gauge to:", metrics.efficiency);
    }
}

// --- Map Updates ---

function updateMap(data, step) {
    // Example: Update stock percentage for a specific hub
    // This requires mapping data.inventory to a specific hub based on context or a region field in data
    // For now, let's just log
    console.log(`Map Update - Step ${step}: Inventory=${data.inventory}, Demand=${data.demand}, Action=${data.action}`);

    // Example: Update a specific hub's stock percentage (requires knowing which hub 'data' refers to)
    // const hubNA = document.querySelector('.hub-group[data-region="na"]');
    // if (hubNA && data.hubRegion === 'na') {
    //    const stockPercentage = (data.inventory / MAX_HUB_CAPACITY) * 100; // Needs MAX_HUB_CAPACITY
    //    // Update the stock percentage display near the hub icon
    // }

    // Animate route flow (requires animation setup in CSS/SVG)
    // Animate truck/ship/plane icons along paths
}

// --- Terminal and Narrative Updates ---

function updateLiveFeed(stepData) {
    // Add new event to the live feed panel
    const feed = document.getElementById('live-activity-feed'); // Assume this element exists
    if (!feed) return;

    const timestamp = new Date().toLocaleTimeString();
    let eventText = '';
    let eventType = 'INFO';
    let statusClass = 'info-badge';
    let icon = '💡';

    if (stepData.lost_sales > 0) {
        eventText = `Demand spike detected: ${stepData.lost_sales} units unfulfilled.`;
        eventType = 'ALERT';
        statusClass = 'alert-badge';
        icon = '❗';
    } else if (stepData.action !== 0 && stepData.action !== undefined) {
        eventText = `Stock reorder triggered: ${stepData.action} units ordered.`;
        eventType = 'ORDER';
        statusClass = 'order-badge';
        icon = '📦';
    } else if (stepData.inventory < 30) {
        eventText = `Inventory low: ${stepData.inventory} units remaining.`;
        eventType = 'WARNING';
        statusClass = 'warning-badge';
        icon = '⚠️';
    }
    // Add more conditions for delays, route updates etc. if backend provides them

    const feedItem = `
        <div class="feed-item">
            <span class="feed-icon">${icon}</span>
            <span class="feed-timestamp">${timestamp}</span>
            <span class="feed-text">${eventText}</span>
            <span class="feed-badge ${statusClass}">${eventType}</span>
        </div>
    `;
    feed.insertAdjacentHTML('afterbegin', feedItem);

    // Limit feed items to prevent excessive growth
    const maxItems = 20;
    while (feed.children.length > maxItems) {
        feed.removeChild(feed.lastChild);
    }
}

// --- Main Simulation Logic ---

async function startSimulation() {
    writeTerminalLine('[NEXUS] Initializing simulation environment...');
    updateStatusIndicators('Initializing...');

    // Apply current settings to the simulation start if API supports it
    const apiResult = await startSimulationAPI(simulationState.settings);

    if (apiResult.success) {
        simulationState.totalSteps = apiResult.steps;
        simulationState.currentStep = 0;
        simulationState.cumulativeReward = 0;
        simulationState.cumulativeDemand = 0;
        simulationState.cumulativeSold = 0;
        simulationState.cumulativeLostSales = 0;
        historyData = [];
        
        // Reset charts and indicators
        initializePlaceholderCharts(); // From chartConfig.js
        updateKPICards({}, {}); // Clear KPIs
        updateGauges({}); // Clear gauges
        updateStatusIndicators('Ready', `0 / ${simulationState.totalSteps}`);
        writeTerminalLine(`[NEXUS] Simulation environment loaded. ${simulationState.totalSteps} steps available.`, 'success-msg');
        updateRunButtonText(false);
        simulationState.isSimulationRunning = false;
        // TODO: Reset map states, live feed, etc.
    } else {
        writeTerminalLine(`[ERROR] ${apiResult.message}`, 'alert-msg');
        updateStatusIndicators('Error');
    }
}

async function runSimulationStep() {
    if (!simulationState.isSimulationRunning) return;

    const apiResult = await runStepAPI();

    if (apiResult.success && apiResult.data) {
        const stepData = apiResult.data.data;
        const done = apiResult.data.done;

        simulationState.currentStep++;
        simulationState.cumulativeReward += stepData.reward;
        simulationState.cumulativeDemand += stepData.demand;
        simulationState.cumulativeSold += stepData.sold;
        simulationState.cumulativeLostSales += stepData.lost_sales;
        historyData.push(stepData);

        // Update UI elements
        updateStatusIndicators('Running', `${simulationState.currentStep} / ${simulationState.totalSteps}`);
        
        // Calculate metrics needed for KPIs/Gauges dynamically
        const serviceLevel = simulationState.cumulativeDemand > 0 ? simulationState.cumulativeSold / simulationState.cumulativeDemand : 0;
        const avgInventory = stepData.inventory; // Use current step inventory for simplicity
        const turnover = (simulationState.cumulativeSold / (avgInventory || 1)).toFixed(2);
        const metrics = {
            serviceLevel: serviceLevel,
            avgInventory: avgInventory,
            turnover: parseFloat(turnover),
            lostSales: simulationState.cumulativeLostSales,
            efficiency: (simulationState.cumulativeReward / (simulationState.cumulativeReward + simulationState.cumulativeLostSales)) || 0 // Example efficiency
        };

        updateKPICards(stepData, metrics);
        updateGauges(metrics);
        updateCharts(stepData, historyData, simulationState.cumulativeReward);
        updateMap(stepData, simulationState.currentStep);
        updateLiveFeed(stepData);
        updateDecisionNarrative(stepData);
        writeTerminalLine(`[Step ${stepData.step}] Action: ${stepData.action}, Reward: ${stepData.reward.toFixed(2)}`, 'step-log');
        
        // Update agent status based on reward
        let agentStatus = 'Stable';
        let statusClass = 'warning';
        if (stepData.reward > 5) { agentStatus = 'Optimal'; statusClass = 'healthy'; } 
        else if (stepData.reward < -10) { agentStatus = 'Critical'; statusClass = 'critical'; }
        if(document.getElementById('agent-status')) {
             document.getElementById('agent-status').innerText = agentStatus;
             document.getElementById('agent-status').className = 'story-value ' + statusClass;
        }

        if (done) {
            simulationState.isSimulationRunning = false;
            updateStatusIndicators('Completed');
            writeTerminalLine('[NEXUS] Simulation finished.', 'success-msg');
            updateRunButtonText(false);
            alert("Simulation Complete!");
        } else {
             // Schedule next step if auto-running
            if (simulationState.isSimulationRunning) {
                setTimeout(runSimulationStep, simulationState.simulationSpeed);
            }
        }
    } else {
        simulationState.isSimulationRunning = false;
        updateStatusIndicators('Error');
        writeTerminalLine(`[ERROR] ${apiResult.message}`, 'alert-msg');
        updateRunButtonText(false);
        alert(`Simulation Step Failed: ${apiResult.message}`);
    }
}

function toggleAutoRun() {
    simulationState.isSimulationRunning = !simulationState.isSimulationRunning;
    updateRunButtonText(simulationState.isSimulationRunning);
    if (simulationState.isSimulationRunning) {
        writeTerminalLine('>> Auto-run simulation started...');
        runSimulationStep(); // Start the loop
    } else {
        writeTerminalLine('>> Auto-run simulation paused.');
    }
}

async function resetSimulation() {
    // Call backend reset API if available
    // const resetResult = await resetSimulationAPI(); 
    // if (!resetResult.success) { alert(resetResult.message); return; }

    simulationState = {
        currentStep: 0,
        totalSteps: 0,
        cumulativeReward: 0,
        cumulativeDemand: 0,
        cumulativeSold: 0,
        cumulativeLostSales: 0,
        isSimulationRunning: false,
        simulationSpeed: 50, 
        settings: { ...simulationState.settings } // Keep current settings
    };
    historyData = [];
    
    initializePlaceholderCharts();
    updateKPICards({}, {});
    updateGauges({});
    updateStatusIndicators('Ready', '0 / 0');
    writeTerminalLine('[NEXUS] Simulation state reset.', 'system-msg');
    updateRunButtonText(false);
    DOM_ELEMENTS.decisionNarrative.innerText = ""; // Clear narrative
    // TODO: Reset map, live feed, etc.
}

// --- Event Listeners Setup ---

function setupEventListeners() {
    // Sidebar Toggle
    const sidebarToggle = document.querySelector('.sidebar-toggle'); // Add this button in HTML
    if (sidebarToggle && DOM_ELEMENTS.sidebar) {
        sidebarToggle.addEventListener('click', () => {
            DOM_ELEMENTS.sidebar.classList.toggle('collapsed');
        });
    }

    // Settings Panel Toggle
    if (DOM_ELEMENTS.openSettingsBtn && DOM_ELEMENTS.closeSettingsBtn && DOM_ELEMENTS.settingsPanel) {
        DOM_ELEMENTS.openSettingsBtn.addEventListener('click', () => {
            DOM_ELEMENTS.settingsPanel.classList.add('active');
            updateSettingsDisplay(); // Load current settings into the panel
        });
        DOM_ELEMENTS.closeSettingsBtn.addEventListener('click', () => {
            DOM_ELEMENTS.settingsPanel.classList.remove('active');
        });
        
        // Apply/Reset Settings Buttons
        if (DOM_ELEMENTS.applySettingsBtn) {
            DOM_ELEMENTS.applySettingsBtn.addEventListener('click', applySettings);
        }
        if (DOM_ELEMENTS.resetDefaultsBtn) {
            DOM_ELEMENTS.resetDefaultsBtn.addEventListener('click', resetSettingsToDefaults);
        }
        
        // Update displayed value when slider/input changes
        document.querySelectorAll('.settings-panel input[type="range"], .settings-panel input[type="number"]').forEach(input => {
            input.addEventListener('input', () => updateSettingValueDisplay(input.id));
        });
    }

    // Simulation Controls (ensure these map to functions like startSimulation, runSimulationStep, toggleAutoRun, resetSimulation)
    // Assuming your HTML has elements with IDs like 'start-sim-btn', 'step-sim-btn', etc.
    document.getElementById('start-sim-btn')?.addEventListener('click', startSimulation);
    document.getElementById('step-sim-btn')?.addEventListener('click', async () => {
        if (simulationState.isSimulationRunning) return; // Don't step if auto-running
        simulationState.isSimulationRunning = false; // Ensure auto-run is off for manual step
        updateRunButtonText(false);
        await runSimulationStep(); 
    });
    document.getElementById('run-btn-text')?.parentElement.addEventListener('click', toggleAutoRun); // Click the menu item to toggle
    document.getElementById('reset-sim-btn')?.addEventListener('click', resetSimulation);

    // Simulation Speed Slider
    if (DOM_ELEMENTS.simulationSpeedSlider) {
        DOM_ELEMENTS.simulationSpeedSlider.addEventListener('input', (e) => {
            simulationState.simulationSpeed = parseInt(e.target.value, 10);
        });
    }

    // TODO: Add event listeners for map zoom, chart interactions, etc.
}

// Initialize UI components on DOM load
function initializeUI() {
    // Initialize Charts
    initCharts(); // From chartConfig.js

    // Load initial settings (e.g., from localStorage or defaults)
    // simulationState.settings = loadSettings(); // Implement loadSettings helper
    updateSettingsDisplay();

    // Setup event listeners
    setupEventListeners();

    // Set initial state display
    updateStatusIndicators('Ready');
    updateKPICards({}, {});
    updateGauges({});
    writeTerminalLine('[NEXUS AI] Dashboard initialized. Ready to optimize.', 'system-msg');
}

document.addEventListener('DOMContentLoaded', initializeUI);
