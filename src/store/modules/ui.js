// Global UI state: the single active modal, data refresh signals and theme.

const THEME_KEY = 'theme';

function readTheme() {
    try {
        return localStorage.getItem(THEME_KEY) || 'light';
    } catch {
        return 'light';
    }
}

export function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
}

// Budget spending is read from report tables that the API updates asynchronously (message queue)
// after a transaction changes, so budgets are refreshed again a little later.
const BUDGET_REFRESH_DELAYS = [1500, 4000];
let budgetRefreshTimers = [];

function scheduleBudgetRefresh(commit) {
    budgetRefreshTimers.forEach(clearTimeout);
    budgetRefreshTimers = BUDGET_REFRESH_DELAYS.map((ms) => setTimeout(() => commit('BUMP', 'budgets'), ms));
}

const state = {
    modal: { type: null, mode: 'create', data: null },
    // Incremented after writes so lists can reload without a full page refresh.
    versions: {
        transactions: 0,
        recurring: 0,
        subscriptions: 0,
        goals: 0,
        labels: 0,
        budgets: 0,
    },
    theme: readTheme(),
};

const getters = {
    isModalOpen: (state) => (type) => state.modal.type === type,
};

const mutations = {
    OPEN_MODAL(state, { type, mode = 'create', data = null }) {
        state.modal = { type, mode, data };
    },
    CLOSE_MODAL(state) {
        state.modal = { type: null, mode: 'create', data: null };
    },
    BUMP(state, scopes) {
        (Array.isArray(scopes) ? scopes : [scopes]).forEach((s) => {
            if (s in state.versions) state.versions[s]++;
        });
    },
    SET_THEME(state, theme) {
        state.theme = theme;
        try {
            localStorage.setItem(THEME_KEY, theme);
        } catch {
            // storage unavailable — theme still applies for this session
        }
        applyTheme(theme);
    },
};

const actions = {
    openModal({ commit }, payload) {
        commit('OPEN_MODAL', typeof payload === 'string' ? { type: payload } : payload);
    },
    closeModal({ commit }) {
        commit('CLOSE_MODAL');
    },
    bump({ commit }, scopes) {
        const list = Array.isArray(scopes) ? scopes : [scopes];
        // Deleting a label also deletes its budgets (synchronously on the server).
        commit('BUMP', list.includes('labels') && !list.includes('budgets') ? [...list, 'budgets'] : list);
        if (list.includes('transactions')) scheduleBudgetRefresh(commit);
    },
    setTheme({ commit }, theme) {
        commit('SET_THEME', theme);
    },
};

export default { namespaced: true, state, getters, mutations, actions };
