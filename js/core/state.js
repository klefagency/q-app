import { parseHash } from "./router.js";
import { hydrate } from "./hydrator.js";

/**
 * State Layer
 * Manages the global state and triggers re-renders on the hydrator
 */
export const state = {
    screen: 'search', // 'search', 'list', 'quote'
    options: {
        tipo: 'todas',
        id: null
    }
};

export function updateState() {
    // 1. Determine state from router
    const routeInfo = parseHash();
    state.screen = routeInfo.screen;
    state.options = routeInfo.options;

    // 2. Trigger rendering pipeline
    hydrate(state);
}

// Bind to History Hash Change
window.addEventListener('hashchange', updateState);
