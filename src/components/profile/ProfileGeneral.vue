<template>
  <div class="stack">
    <div class="card">
      <div class="card-body profile-hero">
        <span class="avatar-xl">{{ userInitials }}</span>
        <div class="hero-text">
          <h2 class="truncate">{{ fullName || '—' }}</h2>
          <p class="muted truncate">{{ email || username }}</p>
        </div>
      </div>
      <dl class="info-list">
        <div class="info-row">
          <dt>{{ $t('profile.general.name') }}</dt>
          <dd>{{ user.name || '—' }}</dd>
        </div>
        <div class="info-row">
          <dt>{{ $t('profile.general.surname') }}</dt>
          <dd>{{ surname || '—' }}</dd>
        </div>
        <div class="info-row">
          <dt>{{ $t('profile.general.username') }}</dt>
          <dd>{{ username || '—' }}</dd>
        </div>
        <div class="info-row">
          <dt>{{ $t('profile.general.email') }}</dt>
          <dd>{{ email || '—' }}</dd>
        </div>
      </dl>
    </div>

    <div class="card">
      <div class="card-head">
        <div>
          <div class="card-title">{{ $t('profile.general.preferences') }}</div>
          <div class="card-subtitle">{{ $t('profile.general.preferencesHint') }}</div>
        </div>
      </div>
      <div class="pref-row">
        <div class="pref-label">
          <vue-feather type="globe" size="17"></vue-feather>
          <div>
            <div class="pref-title">{{ $t('settings.language') }}</div>
            <div class="pref-desc">{{ $t('profile.general.languageHint') }}</div>
          </div>
        </div>
        <div class="segmented">
          <button
            v-for="l in locales"
            :key="l.id"
            type="button"
            :class="{ active: $i18n.locale === l.id }"
            @click="$store.dispatch('changeLanguage', l)"
          >
            <flag-icon :code="l.id" :size="18" />
            {{ l.name }}
          </button>
        </div>
      </div>
      <div class="pref-row">
        <div class="pref-label">
          <vue-feather type="sun" size="17"></vue-feather>
          <div>
            <div class="pref-title">{{ $t('settings.theme') }}</div>
            <div class="pref-desc">{{ $t('profile.general.themeHint') }}</div>
          </div>
        </div>
        <div class="segmented">
          <button
            v-for="opt in themeOptions"
            :key="opt.value"
            type="button"
            :class="{ active: theme === opt.value }"
            @click="$store.dispatch('ui/setTheme', opt.value)"
          >
            <vue-feather :type="opt.icon" size="14"></vue-feather>
            {{ $t(opt.label) }}
          </button>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="pref-row">
        <div class="pref-label">
          <vue-feather type="log-out" size="17"></vue-feather>
          <div>
            <div class="pref-title">{{ $t('common.logout') }}</div>
            <div class="pref-desc">{{ $t('profile.general.logoutHint') }}</div>
          </div>
        </div>
        <button type="button" class="btn btn-secondary" @click="logout">{{ $t('common.logout') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import FlagIcon from '@/components/ui/FlagIcon.vue';
import authService from '@/services/auth.service';
import { localeOptions } from '@/constants/config';
import { initials } from '@/utils/format';

// Claims may arrive with short JWT names or long .NET claim-type URIs.
const SURNAME_KEYS = ['family_name', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'];
const EMAIL_KEYS = ['email', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
const pick = (obj, keys) => keys.map((k) => obj[k]).find(Boolean) || '';

export default {
  name: 'ProfileGeneral',
  components: { FlagIcon },
  data() {
    return {
      locales: localeOptions,
      themeOptions: [
        { value: 'light', label: 'settings.light', icon: 'sun' },
        { value: 'dark', label: 'settings.dark', icon: 'moon' },
        { value: 'system', label: 'settings.system', icon: 'monitor' },
      ],
    };
  },
  computed: {
    user() {
      return this.$store.getters['user/getCurrentUser'] || {};
    },
    surname() {
      return pick(this.user, SURNAME_KEYS);
    },
    email() {
      return pick(this.user, EMAIL_KEYS);
    },
    username() {
      return this.user.preferred_username || '';
    },
    fullName() {
      return [this.user.name, this.surname].filter(Boolean).join(' ');
    },
    userInitials() {
      return initials(this.fullName || this.username);
    },
    theme() {
      return this.$store.state.ui.theme;
    },
  },
  methods: {
    logout() {
      authService.logout();
    },
  },
};
</script>

<style scoped>
.profile-hero {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar-xl {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: linear-gradient(135deg, #1e293b, #059669);
  color: #fff;
  font-size: 22px;
  font-weight: 700;
}

.hero-text {
  min-width: 0;
}

.hero-text h2 {
  font-size: 20px;
  font-weight: 700;
}

.info-list {
  margin: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border-top: 1px solid var(--border);
}

.info-row {
  padding: 14px 20px;
  border-bottom: 1px solid var(--border);
  min-width: 0;
}

.info-row:nth-child(odd) {
  border-right: 1px solid var(--border);
}

.info-row:nth-last-child(-n + 2) {
  border-bottom: 0;
}

.info-row dt {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-3);
}

.info-row dd {
  margin: 2px 0 0;
  font-size: 14px;
  font-weight: 550;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 600px) {
  .info-list {
    grid-template-columns: minmax(0, 1fr);
  }

  .info-row:nth-child(odd) {
    border-right: 0;
  }

  .info-row:nth-last-child(2) {
    border-bottom: 1px solid var(--border);
  }
}

.pref-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px 16px;
  flex-wrap: wrap;
  padding: 16px 20px;
}

.pref-row + .pref-row {
  border-top: 1px solid var(--border);
}

.pref-label {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  color: var(--text-2);
  min-width: 0;
}

.pref-label .vue-feather {
  margin-top: 2px;
}

.pref-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.pref-desc {
  font-size: 12.5px;
  color: var(--text-3);
}
</style>
