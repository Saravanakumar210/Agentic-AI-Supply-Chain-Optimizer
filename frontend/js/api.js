
const BASE_URL = '/api'; // Assuming your backend API is at /api

export async function startSimulationAPI(settings = {}) {
    try {
        const response = await fetch(`${BASE_URL}/start_simulation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        });
        const data = await response.json();
        if (response.ok) {
            return { success: true, steps: data.steps || 0, message: data.message || "Simulation Started" };
        } else {
            return { success: false, message: data.error || "Failed to start simulation" };
        }
    } catch (error) {
        console.error("API Error (startSimulationAPI):", error);
        return { success: false, message: error.message || "Network error" };
    }
}

export async function runStepAPI() {
    try {
        const response = await fetch(`${BASE_URL}/step`, { method: 'POST' });
        const data = await response.json();
        if (response.ok) {
            return { success: true, data: data }; // data contains { done, data: {...} }
        } else {
            return { success: false, message: data.error || "Failed to run step" };
        }
    } catch (error) {
        console.error("API Error (runStepAPI):", error);
        return { success: false, message: error.message || "Network error" };
    }
}

export async function getResultsAPI() {
    try {
        const response = await fetch(`${BASE_URL}/results`, { method: 'GET' });
        const data = await response.json();
        if (response.ok) {
            return { success: true, data: data }; // data contains { metrics, history }
        } else {
            return { success: false, message: data.error || "Failed to get results" };
        }
    } catch (error) {
        console.error("API Error (getResultsAPI):", error);
        return { success: false, message: error.message || "Network error" };
    }
}

export async function resetSimulationAPI() {
    try {
        // Assuming a POST or DELETE endpoint for reset, adjust if needed
        const response = await fetch(`${BASE_URL}/reset`, { method: 'POST' }); 
        const data = await response.json();
         if (response.ok) {
            return { success: true, message: data.message || "Simulation reset" };
        } else {
            return { success: false, message: data.error || "Failed to reset simulation" };
        }
    } catch (error) {
        console.error("API Error (resetSimulationAPI):", error);
        return { success: false, message: error.message || "Network error" };
    }
}

// Add other API functions as needed (e.g., for settings)
