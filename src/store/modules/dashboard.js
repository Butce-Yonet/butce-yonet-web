// Reference data shared across the app (currencies + user labels).
import currencyService from '@/services/currency.service';
import userLabelService from '@/services/user.label.service';

const state = {
    currencies: [],
    labels: [],
    labelsLoaded: false,
    currenciesLoaded: false,
};

const getters = {
    getCurrencies: (state) => state.currencies,
    getLabels: (state) => state.labels,
};

const mutations = {
    setCurrencies: (state, currencies) => {
        state.currencies = currencies || [];
        state.currenciesLoaded = true;
    },
    setLabels: (state, labels) => {
        state.labels = labels || [];
        state.labelsLoaded = true;
    },
};

const actions = {
    setCurrencies: ({ commit }, currencies) => commit('setCurrencies', currencies),
    setLabels: ({ commit }, labels) => commit('setLabels', labels),

    async loadCurrencies({ commit, state }, { force = false } = {}) {
        if (state.currenciesLoaded && !force) return state.currencies;
        const response = await currencyService.getCurrencies();
        commit('setCurrencies', response.data);
        return response.data;
    },

    async loadLabels({ commit, state }, { force = false } = {}) {
        if (state.labelsLoaded && !force) return state.labels;
        const response = await userLabelService.getUserLabels();
        const labels = (response.data?.data || []).map((item) => ({
            ...item,
            colorCode: item.colorCode || '#10b981',
        }));
        commit('setLabels', labels);
        return labels;
    },
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions,
};
