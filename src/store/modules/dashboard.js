const state = {
    currencies: [],
    labels: [],
    openTransactionModalTrigger: 0,
    openRecurringTransactionModalTrigger: 0,
    pendingOpenTransactionModal: false,
    pendingOpenRecurringTransactionModal: false,
    pendingOpenLabelModal: false,
}

const getters = {
    getCurrencies : state => {
        return state.currencies;
    },
    getLabels : state => {
        return state.labels;
    }
}

const mutations = {
    setCurrencies: (state, currencies) => {
        state.currencies = currencies;
    },
    setLabels: (state, labels) => {
        state.labels = labels;
    },
    triggerOpenTransactionModal: (state) => {
        state.openTransactionModalTrigger++;
    },
    triggerOpenRecurringTransactionModal: (state) => {
        state.openRecurringTransactionModalTrigger++;
    },
    setPendingOpenTransactionModal: (state, val) => {
        state.pendingOpenTransactionModal = val;
    },
    setPendingOpenRecurringTransactionModal: (state, val) => {
        state.pendingOpenRecurringTransactionModal = val;
    },
    setPendingOpenLabelModal: (state, val) => {
        state.pendingOpenLabelModal = val;
    },
}

const actions = {
    setCurrencies: (context, currencies) => {
        context.commit('setCurrencies', currencies);
    },
    setLabels: (context, labels) => {
        context.commit('setLabels', labels);
    },
    triggerOpenTransactionModal: (context) => {
        context.commit('triggerOpenTransactionModal');
    },
    triggerOpenRecurringTransactionModal: (context) => {
        context.commit('triggerOpenRecurringTransactionModal');
    },
    setPendingOpenTransactionModal: (context, val) => {
        context.commit('setPendingOpenTransactionModal', val);
    },
    setPendingOpenRecurringTransactionModal: (context, val) => {
        context.commit('setPendingOpenRecurringTransactionModal', val);
    },
    setPendingOpenLabelModal: (context, val) => {
        context.commit('setPendingOpenLabelModal', val);
    },
}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
};