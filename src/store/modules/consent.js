const state = {
    pendingConsents: [],
    totalCount: 0,
};

const getters = {
    hasPending:     state => state.pendingConsents.length > 0,
    currentConsent: state => state.pendingConsents[0] || null,
    currentStep:    state => state.totalCount - state.pendingConsents.length + 1,
    totalCount:     state => state.totalCount,
};

const mutations = {
    SET_PENDING(state, { consents, total }) {
        state.pendingConsents = consents;
        state.totalCount = total;
    },
    SHIFT(state) {
        state.pendingConsents = state.pendingConsents.slice(1);
    },
};

const actions = {
    setPending({ commit }, payload) {
        commit('SET_PENDING', payload);
    },
    acceptCurrent({ commit }) {
        commit('SHIFT');
    },
};

export default { namespaced: true, state, getters, mutations, actions };
