// --- UI Update Functions ---

// Dummy function for gauge updates - replace with actual implementation
function updateGaugeValue(gaugeElement, value) {
    console.log(`Updating Gauge ${gaugeElement.id} to ${value.toFixed(1)}%`);
    // Example: Animate needle or color based on value
    // gaugeElement.style.setProperty('--gauge-value', value);
}

// Dummy function for map animations - replace with real SVG/canvas logic
function animateMapElements() {
    console.log("Animating map elements...");
    // Logic to animate trucks/ships/planes along routes, pulse hubs, etc.
}

// Function to update all relevant UI components based on simulation state
export function updateDashboardUI(simulationState, metrics) {
    // Update KPIs
    if (document.getElementById('total-profit-value')) {
        document.getElementById('total-profit-value').innerText = `$${simulationState.cumulativeReward.toFixed(0)}`;
    }
    if (document.getElementById('service-level-value')) {
        document.getElementById('service-level-value').innerText = metrics.serviceLevel ? `${(metrics.serviceLevel * 100).toFixed(1)}%` : '0%';
    }
    if (document.getElementById('avg-inventory-value')) {
        document.getElementById('avg-inventory-value').innerText = metrics.avgInventory !== undefined ? `${metrics.avgInventory} units` : '0';
    }
    if (document.getElementById('inventory-turnover-value')) {
        document.getElementById('inventory-turnover-value').innerText = metrics.turnover ? metrics.turnover.toFixed(2) : '0.00';
    }
    if (document.getElementById('total-lost-sales-value')) {
        document.getElementById('total-lost-sales-value').innerText = metrics.lostSales !== undefined ? `${metrics.lostSales}` : '0';
    }

    // Update Gauges (assuming IDs and a function to update them)
    if (document.getElementById('service-level-gauge')) {
        updateGaugeValue(document.getElementById('service-level-gauge'), metrics.serviceLevel * 100);
    }
    if (document.getElementById('inventory-utilization-gauge')) {
        // Normalize inventory utilization if max capacity is known
        updateGaugeValue(document.getElementById('inventory-utilization-gauge'), (metrics.avgInventory / 500) * 100); // Example max capacity 500
    }
    if (document.getElementById('supply-chain-efficiency-gauge') && metrics.efficiency) {
        updateGaugeValue(document.getElementById('supply-chain-efficiency-gauge'), metrics.efficiency * 100);
    }

    // Update Map (this is a placeholder)
    // animateMapElements(); // Trigger map animations

    // Update Live Feed (placeholder - actual update happens in simulationManager)
    // updateLiveFeed(stepData); 

    // Update Status and Progress
    if (document.getElementById('status')) {
        document.getElementById('status').innerText = simulationState.isSimulationRunning ? 'Running' : (simulationState.currentStep >= simulationState.totalSteps ? 'Completed' : 'Paused/Ready');
    }
    if (document.getElementById('progress')) {
        document.getElementById('progress').innerText = `${simulationState.currentStep} / ${simulationState.totalSteps}`;
    }
    
    // Update Agent Status Display
    const agentStatusEl = document.getElementById('agent-status');
    if (agentStatusEl) {
        let agentStatus = 'Stable';
        let statusClass = 'warning'; // default
        if (stepData.reward > 5) { agentStatus = 'Optimal'; statusClass = 'healthy'; } 
        else if (stepData.reward < -10) { agentStatus = 'Critical'; statusClass = 'critical'; }
        agentStatusEl.innerText = agentStatus;
        agentStatusEl.className = 'story-value ' + statusClass;
    }
}

export function updateTerminal(text, type = '') {
    const terminal = document.getElementById('agentTerminal');
    if (!terminal) return;

    const line = document.createElement('div');
    line.className = `terminal-line ${type}`;
    line.innerHTML = text; // Allow for styled elements within the text
    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight; // Auto-scroll
}

export function updateDecisionNarrative(data) {
    const narrative = document.getElementById('decisionNarrative');
    if (!narrative) return;

    let text = "";
    const inventory = data.inventory;
    const reward = data.reward;

    if (inventory < 30) {
        text = `⚠️ <b>Critical Stock Alert:</b> Inventory is low (${inventory} units). Agent likely prioritizing replenishment to avoid stockout penalties.`;
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

    narrative.innerHTML = text;
}

// --- Settings Panel UI Functions ---

export function updateSettingsPanelUI(settings) {
    // Update input values
    document.getElementById('holding-cost').value = settings.holdingCost;
    document.getElementById('stockout-penalty').value = settings.stockoutPenalty;
    document.getElementById('order-lead-time').value = settings.orderLeadTime;
    document.getElementById('initial-inventory').value = settings.initialInventory;
    document.getElementById('simulation-steps').value = settings.simulationSteps;
    
    // Update displayed values next to sliders
    updateSettingValueDisplay('holding-cost', settings.holdingCost);
    updateSettingValueDisplay('stockout-penalty', settings.stockoutPenalty);
    updateSettingValueDisplay('order-lead-time', settings.orderLeadTime);
}

function updateSettingValueDisplay(id, value) {
    const display = document.getElementById(`${id}-value`);
    if (display) {
        display.textContent = value;
    }
}

export function toggleSettingsPanel() {
    const panel = document.getElementById('settings-panel');
    if (panel) {
        panel.classList.toggle('active');
    }
}

// --- Event Listeners Setup ---

export function setupEventListeners() {
    // Sidebar Toggle (Assuming a button with class 'sidebar-toggle')
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            document.querySelector('.sidebar-navigation').classList.toggle('collapsed');
        });
    }

    // Settings Panel Toggle
    const openSettingsBtn = document.getElementById('open-settings-btn');
    const closeSettingsBtn = document.getElementById('close-settings-btn');
    if (openSettingsBtn) {
        openSettingsBtn.addEventListener('click', toggleSettingsPanel);
    }
    if (closeSettingsBtn) {
        closeSettingsBtn.addEventListener('click', toggleSettingsPanel);
    }

    // Apply/Reset Settings Buttons
    const applySettingsBtn = document.getElementById('apply-settings-btn');
    const resetDefaultsBtn = document.getElementById('reset-defaults-btn');
    if (applySettingsBtn) {
        applySettingsBtn.addEventListener('click', () => {
            // In a real app, you'd call a function here to save/apply settings
            alert('Settings applied locally. Re-initialize simulation for changes.');
            toggleSettingsPanel(); // Close panel
        });
    }
    if (resetDefaultsBtn) {
        resetDefaultsBtn.addEventListener('click', () => {
            // Call a function to reset settings to default
            alert('Settings reset to defaults. Re-initialize simulation.');
        });
    }

    // Update displayed values when sliders change
    document.querySelectorAll('.settings-panel input[type="range"], .settings-panel input[type="number"]').forEach(input => {
        input.addEventListener('input', () => {
            updateSettingValueDisplay(input.id, input.value);
        });
    });

    // Simulation Control Buttons (Map these to functions in simulationManager.js)
    document.getElementById('Initialize Agent')?.addEventListener('click', window.startSimulation); // Assuming window.startSimulation is globally available
    document.getElementById('Step Simulation')?.addEventListener('click', async () => {
        if (window.simulationState.isSimulationRunning) return; // Prevent stepping during auto-run
        window.simulationState.isSimulationRunning = false; // Stop auto-run if active
        window.updateRunButtonText(false);
        await window.runSimulationStep(); // Assuming window.runSimulationStep is global
    });
    // Toggle Auto-Run (assuming menu item click triggers this)
    const autoRunMenuItem = Array.from(document.querySelectorAll('.menu-text')).find(el => el.innerText === 'Auto-Run Agent' || el.innerText === 'Pause Auto-Run');
    if (autoRunMenuItem) {
        autoRunMenuItem.parentElement.addEventListener('click', () => {
            window.toggleAutoRun(); // Assuming window.toggleAutoRun is global
        });
    }
    document.getElementById('Calculate KPIs')?.addEventListener('click', window.getResults); // Assuming window.getResults is global
    document.getElementById('Reset State')?.addEventListener('click', window.resetSimulation); // Assuming window.resetSimulation is global

    // Simulation Speed Slider
    const speedSlider = document.getElementById('simulation-speed');
    if (speedSlider) {
        speedSlider.addEventListener('input', (e) => {
            window.simulationState.simulationSpeed = parseInt(e.target.value, 10);
        });
    }
}
