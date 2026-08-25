const state = {
    currencies: [],
    labels: [],
    openTransactionModalTrigger: 0,
    openRecurringTransactionModalTrigger: 0,
    openSubscriptionModalTrigger: 0,
    openGoalModalTrigger: 0,
    pendingOpenTransactionModal: false,
    pendingOpenRecurringTransactionModal: false,
    pendingOpenLabelModal: false,
    pendingOpenSubscriptionModal: false,
    pendingOpenGoalModal: false,
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
    triggerOpenSubscriptionModal: (state) => {
        state.openSubscriptionModalTrigger++;
    },
    triggerOpenGoalModal: (state) => {
        state.openGoalModalTrigger++;
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
    setPendingOpenSubscriptionModal: (state, val) => {
        state.pendingOpenSubscriptionModal = val;
    },
    setPendingOpenGoalModal: (state, val) => {
        state.pendingOpenGoalModal = val;
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
    triggerOpenSubscriptionModal: (context) => {
        context.commit('triggerOpenSubscriptionModal');
    },
    triggerOpenGoalModal: (context) => {
        context.commit('triggerOpenGoalModal');
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
    setPendingOpenSubscriptionModal: (context, val) => {
        context.commit('setPendingOpenSubscriptionModal', val);
    },
    setPendingOpenGoalModal: (context, val) => {
        context.commit('setPendingOpenGoalModal', val);
    },
}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
};