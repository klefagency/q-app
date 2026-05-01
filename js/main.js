import { updateState } from "./core/state.js";

/**
 * Main application entry point for the Klef POS SPA
 */
document.addEventListener("DOMContentLoaded", () => {
    // Trigger initial routing
    updateState();
});
