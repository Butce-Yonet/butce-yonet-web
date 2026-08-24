const state = {
    currentUser:
        window.localStorage.getItem('current_user') ?
            JSON.parse(window.localStorage.getItem('current_user')) : {}
}

const getters = {
    getCurrentUser(state) {
        return state.currentUser;
    }
}

const mutations = {
    setCurrentUser(state, user) {
        state.currentUser = user;
    }
}

const actions = {
    setCurrentUser({ commit }, user) {
        window.localStorage.setItem('current_user', JSON.stringify(user));
        commit('setCurrentUser', user);
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}