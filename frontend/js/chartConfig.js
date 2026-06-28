
// Chart Theme Configuration
const chartTheme = {
    light: {
        textColor: '#333',
        gridColor: '#eee',
        tooltipBg: '#fff',
        tooltipBorder: '#ccc',
        primary: '#3b82f6', // blue
        secondary: '#6366f1', // indigo
        accent: '#10b981', // emerald
        warning: '#f59e0b', // amber
        danger: '#ef4444' // red
    },
    dark: {
        textColor: '#E0E0E0',
        gridColor: 'rgba(255, 255, 255, 0.1)',
        tooltipBg: '#1F2937', // Dark gray
        tooltipBorder: 'rgba(255, 255, 255, 0.15)',
        primary: '#60A5FA', // light blue
        secondary: '#818CF8', // indigo
        accent: '#34D399', // emerald
        warning: '#F59E0B', // amber
        danger: '#F87171' // red
    }
};

// Determine current theme (default to dark if not specified or supported)
const currentTheme = chartTheme.dark; // Always use dark for this design

// Chart.js Defaults Setup
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.font.size = 11;
Chart.defaults.color = currentTheme.textColor;

// Function to create charts with consistent styling
function createChart(ctx, config) {
    return new Chart(ctx, {
        ...config,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: currentTheme.textColor,
                        font: { family: "'Inter', sans-serif", size: 11 },
                        usePointStyle: true, 
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: currentTheme.tooltipBg,
                    borderColor: currentTheme.tooltipBorder,
                    borderWidth: 1,
                    titleFont: { weight: '700' },
                    bodyFont: { weight: '400' },
                    padding: 10
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: currentTheme.textColor }
                },
                y: {
                    grid: { color: currentTheme.gridColor, drawBorder: false },
                    ticks: { color: currentTheme.textColor }
                }
            }
        }
    });
}

// --- Chart Initialization Functions ---

let inventoryChart, demandChart, rewardChart, shipmentChart, costChart;

export function initCharts() {
    // Inventory Trend Chart
    const invCtx = document.getElementById('inventoryChart')?.getContext('2d');
    if (invCtx) {
        inventoryChart = createChart(invCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Inventory Level',
                    data: [],
                    borderColor: currentTheme.primary,
                    backgroundColor: 'rgba(96, 165, 250, 0.1)', // Light blue accent
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 4
                }]
            },
            options: {
                 scales: {
                    y: { beginAtZero: true, ticks: { callback: function(value) { return value + ' units'; } } },
                    x: { display: false } // Hide x-axis labels for mini-charts
                },
                plugins: { legend: { display: false } },
                interaction: { mode: 'index', intersect: false },
            }
        });
    }

    // Demand Forecast Chart
    const demCtx = document.getElementById('demandChart')?.getContext('2d');
    if (demCtx) {
        demandChart = createChart(demCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Incoming Demand',
                        data: [],
                        backgroundColor: 'rgba(245, 158, 11, 0.4)', // Amber
                        borderColor: currentTheme.warning,
                        borderWidth: 1
                    },
                    {
                        label: 'Fulfilled Sales',
                        data: [],
                        backgroundColor: 'rgba(56, 189, 248, 0.4)', // Light Blue
                        borderColor: currentTheme.primary,
                        borderWidth: 1
                    }
                ]
            },
             options: {
                scales: {
                    y: { beginAtZero: true, ticks: { callback: function(value) { return value + ' units'; } } },
                    x: { grid: { color: currentTheme.gridColor } } // Show grid for x-axis
                },
                plugins: { legend: { position: 'top', labels: { font: { size: 10 } } } },
            }
        });
    }

    // Reward (Profit) vs Cost Analysis Chart
    const rewCtx = document.getElementById('rewardChart')?.getContext('2d');
    if (rewCtx) {
        rewardChart = createChart(rewCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Cumulative Profit',
                        data: [],
                        borderColor: currentTheme.accent, // Emerald
                        backgroundColor: 'rgba(52, 211, 153, 0.1)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 2.5,
                        pointRadius: 0
                    },
                     {
                        label: 'Cumulative Costs',
                        data: [],
                        borderColor: currentTheme.danger, // Red
                        backgroundColor: 'rgba(248, 113, 115, 0.1)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 2.5,
                        pointRadius: 0
                    }
                ]
            },
            options: {
                scales: {
                    y: { beginAtZero: true, ticks: { callback: function(value) { return '$' + value.toFixed(0); } } },
                     x: { display: false } 
                },
                 plugins: { legend: { position: 'top', labels: { font: { size: 10 } } } },
            }
        });
    }

    // Shipment Performance Doughnut Chart
    const shipCtx = document.getElementById('shipmentChart')?.getContext('2d');
    if (shipCtx) {
        shipmentChart = createChart(shipCtx, {
            type: 'doughnut',
            data: {
                labels: ['On-Time', 'Delayed', 'Cancelled'],
                datasets: [{
                    data: [0, 0, 0],
                    backgroundColor: [
                        currentTheme.accent, // Emerald (On-Time)
                        currentTheme.warning,  // Amber (Delayed)
                        currentTheme.danger    // Red (Cancelled)
                    ],
                    borderColor: '#1E293B', // Dark border
                    hoverOffset: 15
                }]
            },
            options: {
                cutout: '70%', // Doughnut hole size
                plugins: {
                    legend: { position: 'bottom', labels: { font: { size: 10 } } },
                    tooltip: { callbacks: { label: function(context) { return context.label + ': ' + context.raw + ' shipments'; } } }
                }
            }
        });
    }

    // Cost Breakdown Doughnut Chart
    const costCtx = document.getElementById('costChart')?.getContext('2d');
    if (costCtx) {
        costChart = createChart(costCtx, {
            type: 'doughnut',
            data: {
                labels: ['Holding Costs', 'Transport Costs', 'Stockout Costs', 'Other Costs'],
                datasets: [{
                    data: [0, 0, 0, 0],
                    backgroundColor: [
                        currentTheme.primary,    // Blue (Holding)
                        currentTheme.secondary,  // Indigo (Transport)
                        currentTheme.danger,     // Red (Stockout)
                        'rgba(148, 160, 176, 0.6)' // Gray (Other)
                    ],
                    borderColor: '#1E293B', // Dark border
                    hoverOffset: 15
                }]
            },
            options: {
                cutout: '70%', // Doughnut hole size
                 plugins: {
                    legend: { position: 'bottom', labels: { font: { size: 10 } } },
                     tooltip: { callbacks: { label: function(context) { return context.label + ': $' + context.raw.toFixed(2); } } }
                }
            }
        });
    }
}

// Function to update charts with new data
export function updateCharts(stepData, history, cumulativeReward) {
    const labels = history.map(d => `Step ${d.step}`);

    // Inventory Trend
    if (inventoryChart) {
        inventoryChart.data.labels = labels.slice(-50); // Show last 50 steps
        inventoryChart.data.datasets[0].data = history.map(d => d.inventory).slice(-50);
        inventoryChart.update();
    }

    // Demand Forecast
    if (demandChart) {
        demandChart.data.labels = labels.slice(-50);
        demandChart.data.datasets[0].data = history.map(d => d.demand).slice(-50);
        demandChart.data.datasets[1].data = history.map(d => d.sold).slice(-50);
        demandChart.update();
    }

    // Profit vs Cost Analysis
    if (rewardChart) {
        rewardChart.data.labels = labels.slice(-50);
        // Assuming cost is implicitly derived or available, otherwise needs backend change
        // For now, let's use a placeholder or simplified cost calculation if possible
        // Placeholder: Total Cost = (Total Sold * Avg Sale Price) + (Total Inventory * Holding Cost) + Total Lost Sales * Penalty
        // This requires more context on how costs are calculated in backend
        const cumulativeCosts = history.map(d => (d.sold * 10) + (d.inventory * 0.5) + (d.lost_sales * 10)); // Example cost calc
        rewardChart.data.datasets[0].data = history.map(d => d.reward).slice(-50); // NOTE: This is step reward, not cumulative
        // We need cumulative profit and cumulative cost lines, not just step reward
        // For now, let's plot cumulative reward correctly
        const cumulativeProfits = history.map(d => cumulativeReward).slice(-50); // Needs actual cumulative sum
        rewardChart.data.datasets[0].data = cumulativeProfits;
        // Placeholder for costs - requires backend integration or complex frontend calc
        // rewardChart.data.datasets[1].data = ...
        rewardChart.update();
    }

    // Shipment Performance (Example - requires data structure change or new API)
    if (shipmentChart) {
        const shipmentData = {
            onTime: history.filter(d => d.info?.shipment_status === 'on-time').length,
            delayed: history.filter(d => d.info?.shipment_status === 'delayed').length,
            cancelled: history.filter(d => d.info?.shipment_status === 'cancelled').length
        };
        shipmentChart.data.datasets[0].data = [shipmentData.onTime, shipmentData.delayed, shipmentData.cancelled];
        shipmentChart.update();
    }

    // Cost Breakdown (Example - requires data structure change or new API)
    if (costChart) {
        // Placeholder - this needs detailed cost data from the backend
        const costs = { holding: 150, transport: 200, stockout: 50, other: 30 };
        costChart.data.datasets[0].data = [costs.holding, costs.transport, costs.stockout, costs.other];
        costChart.update();
    }
}

// Helper to update placeholder charts if data isn't immediately available
export function initializePlaceholderCharts() {
    const emptyData = [0, 0, 0, 0, 0];
    const emptyLabels = Array(5).fill('');

    if (inventoryChart) {
        inventoryChart.data.labels = emptyLabels;
        inventoryChart.data.datasets[0].data = emptyData;
        inventoryChart.update();
    }
    if (demandChart) {
        demandChart.data.labels = emptyLabels;
        demandChart.data.datasets[0].data = emptyData;
        demandChart.data.datasets[1].data = emptyData;
        demandChart.update();
    }
    if (rewardChart) {
        rewardChart.data.labels = emptyLabels;
        rewardChart.data.datasets[0].data = emptyData;
        rewardChart.data.datasets[1].data = emptyData;
        rewardChart.update();
    }
     if (shipmentChart) {
        shipmentChart.data.datasets[0].data = [1, 1, 1]; // Avoid all zeros
        shipmentChart.update();
    }
     if (costChart) {
        costChart.data.datasets[0].data = [1, 1, 1, 1]; // Avoid all zeros
        costChart.update();
    }
}
