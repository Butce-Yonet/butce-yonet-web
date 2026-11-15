// User notification channel preferences (Profile > Notifications), shared so the app-wide
// nudge banner and the settings page stay in sync.
import authService from '@/services/auth.service';

const state = {
    settings: [], // [{ name, icon, isEnabled }]
    loaded: false,
    loading: false,
};

const getters = {
    channel: (state) => (name) => state.settings.find((s) => s.name === name) || null,
    // Channels the user has turned off (only the ones the server knows about).
    disabledChannels: (state) => state.settings.filter((s) => !s.isEnabled).map((s) => s.name),
};

const mutations = {
    SET_SETTINGS(state, settings) {
        state.settings = settings;
        state.loaded = true;
    },
    SET_LOADING(state, value) {
        state.loading = value;
    },
    SET_ENABLED(state, { name, isEnabled }) {
        const s = state.settings.find((x) => x.name === name);
        if (s) s.isEnabled = isEnabled;
    },
};

const actions = {
    // Returns true on success. Pass force to reload even when already loaded.
    async load({ state, commit }, { force = false } = {}) {
        if (state.loading || (state.loaded && !force)) return state.loaded;
        commit('SET_LOADING', true);
        const res = await authService.getNotificationSettings();
        commit('SET_LOADING', false);
        if (!res.ok || !Array.isArray(res.data)) return false;
        commit('SET_SETTINGS', res.data.map((s) => ({
            name: s.name ?? s.Name,
            icon: s.icon ?? s.Icon,
            isEnabled: !!(s.isEnabled ?? s.IsEnabled),
        })));
        return true;
    },
    // Saves one channel; reverts the local value when the request fails. Returns true on success.
    async setEnabled({ commit, getters }, { name, isEnabled }) {
        const previous = getters.channel(name)?.isEnabled;
        commit('SET_ENABLED', { name, isEnabled }); // optimistic
        const res = await authService.updateNotificationSettings([{ name, isEnabled }]);
        if (!res.ok && previous !== undefined) commit('SET_ENABLED', { name, isEnabled: previous });
        return res.ok;
    },
    // Reflects a change that was already saved elsewhere (e.g. enablePushNotifications).
    markEnabled({ commit }, { name, isEnabled }) {
        commit('SET_ENABLED', { name, isEnabled });
    },
};

export default { namespaced: true, state, getters, mutations, actions };
