import { createStore } from 'vuex';
import i18n from '@/locales';
import authService from '@/services/auth.service';

import user from './modules/user';
import dashboard from './modules/dashboard';
import consent from './modules/consent';
import ui from './modules/ui';
import notifications from './modules/notifications';

export default createStore({
  state: {
    langIcon: localStorage.getItem('currentLanguageIcon') || '',
    langLangauge: localStorage.getItem('currentLanguage') || '',
  },
  getters: {
    langIcon: (state) => state.langIcon,
    langLangauge: (state) => state.langLangauge,
  },
  mutations: {
    changeLang(state, payload) {
      localStorage.setItem('currentLanguage', payload.id);
      localStorage.setItem('currentLanguageIcon', payload.icon || '');
      state.langIcon = payload.icon || '';
      state.langLangauge = payload.id || 'en';
    },
  },
  actions: {
    setLang({ commit }, payload) {
      commit('changeLang', payload);
    },
    // Switches the UI language, records it as the user's active language and reloads the page,
    // so data already fetched in the old language (e.g. server-translated texts) is loaded again.
    async changeLanguage({ commit }, locale) {
      if (!locale || i18n.global.locale === locale.id) return;
      i18n.global.locale = locale.id;
      document.documentElement.setAttribute('lang', locale.id);
      commit('changeLang', locale); // persisted to localStorage, read again on startup
      // Wait for the save so the reload doesn't cancel the request; it never throws.
      await authService.setActiveLanguage(locale.id);
      window.location.reload();
    },
  },
  modules: {
    user,
    dashboard,
    consent,
    ui,
    notifications,
  },
});
