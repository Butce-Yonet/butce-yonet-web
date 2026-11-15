<template>
  <div class="prefs">
    <!-- Theme -->
    <div class="pref" v-click-outside="() => (open = open === 'theme' ? null : open)">
      <button
        type="button"
        class="btn-icon bordered"
        :aria-label="$t('settings.toggleTheme')"
        :aria-expanded="open === 'theme'"
        v-tooltip="open ? '' : $t('settings.theme')"
        @click="toggle('theme')"
      >
        <vue-feather :type="currentTheme.icon" size="17"></vue-feather>
      </button>
      <transition name="pop">
        <div v-if="open === 'theme'" class="menu pref-menu">
          <div class="menu-label">{{ $t('settings.theme') }}</div>
          <button
            v-for="opt in themeOptions"
            :key="opt.value"
            type="button"
            class="menu-item"
            :class="{ active: theme === opt.value }"
            @click="setTheme(opt.value)"
          >
            <vue-feather :type="opt.icon" size="16"></vue-feather>
            <span class="menu-text">{{ $t(opt.label) }}</span>
            <vue-feather v-if="theme === opt.value" type="check" size="15"></vue-feather>
          </button>
        </div>
      </transition>
    </div>

    <!-- Language -->
    <div class="pref" v-click-outside="() => (open = open === 'lang' ? null : open)">
      <button
        type="button"
        class="btn btn-secondary lang-btn"
        :aria-label="$t('settings.changeLanguage')"
        :aria-expanded="open === 'lang'"
        @click="toggle('lang')"
      >
        <flag-icon :code="$i18n.locale" :size="20" />
        <span>{{ $i18n.locale.toUpperCase() }}</span>
      </button>
      <transition name="pop">
        <div v-if="open === 'lang'" class="menu pref-menu">
          <div class="menu-label">{{ $t('settings.language') }}</div>
          <button
            v-for="l in locales"
            :key="l.id"
            type="button"
            class="menu-item"
            :class="{ active: $i18n.locale === l.id }"
            @click="changeLocale(l)"
          >
            <flag-icon :code="l.id" :size="22" />
            <span class="menu-text">{{ l.name }}</span>
            <vue-feather v-if="$i18n.locale === l.id" type="check" size="15"></vue-feather>
          </button>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import { localeOptions } from '@/constants/config';
import FlagIcon from '@/components/ui/FlagIcon.vue';

export default {
  name: 'PreferenceMenus',
  components: { FlagIcon },
  data() {
    return {
      open: null,
      locales: localeOptions,
      themeOptions: [
        { value: 'light', label: 'settings.light', icon: 'sun' },
        { value: 'dark', label: 'settings.dark', icon: 'moon' },
        { value: 'system', label: 'settings.system', icon: 'monitor' },
      ],
    };
  },
  computed: {
    theme() {
      return this.$store.state.ui.theme;
    },
    currentTheme() {
      return this.themeOptions.find((o) => o.value === this.theme) || this.themeOptions[0];
    },
  },
  methods: {
    toggle(name) {
      this.open = this.open === name ? null : name;
    },
    setTheme(value) {
      this.$store.dispatch('ui/setTheme', value);
      this.open = null;
    },
    changeLocale(locale) {
      this.open = null;
      this.$store.dispatch('changeLanguage', locale);
    },
  },
};
</script>

<style scoped>
.prefs {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pref {
  position: relative;
}

.lang-btn {
  height: 36px;
  padding: 0 10px;
  gap: 6px;
  font-size: 13px;
}

.pref-menu {
  top: calc(100% + 8px);
  right: 0;
  min-width: 190px;
}

</style>
