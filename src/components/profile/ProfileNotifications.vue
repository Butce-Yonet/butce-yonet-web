<template>
  <div class="card">
    <div class="card-head">
      <div>
        <div class="card-title">{{ $t('profile.notifications.title') }}</div>
        <div class="card-subtitle">{{ $t('profile.notifications.subtitle') }}</div>
      </div>
    </div>

    <!-- Browser (web push) permission — only when FCM is configured and supported -->
    <div v-if="pushSupported" class="push-row">
      <span class="notif-icon" :class="'push-' + pushPermission">
        <vue-feather :type="pushPermission === 'granted' ? 'bell' : 'bell-off'" size="18"></vue-feather>
      </span>
      <div class="notif-text">
        <span class="notif-title">{{ $t('profile.notifications.browser.title') }}</span>
        <span class="notif-desc">{{ $t('profile.notifications.browser.' + pushPermission) }}</span>
      </div>
      <button
        v-if="pushPermission === 'default'"
        type="button"
        class="btn btn-secondary btn-sm"
        :disabled="pushBusy"
        @click="enablePush"
      >
        <span v-if="pushBusy" class="spinner sm"></span>
        {{ $t('profile.notifications.browser.enable') }}
      </button>
      <span v-else class="badge" :class="pushPermission === 'granted' ? 'success' : 'danger'">
        {{ $t('profile.notifications.browser.' + pushPermission + 'Badge') }}
      </span>
    </div>

    <div v-if="loading" class="loading-box"><span class="spinner lg"></span></div>

    <empty-state
      v-else-if="loadError"
      icon="alert-triangle"
      :title="$t('profile.notifications.loadError')"
      compact
    >
      <button type="button" class="btn btn-secondary btn-sm" @click="load">{{ $t('profile.notifications.retry') }}</button>
    </empty-state>

    <empty-state v-else-if="!settings.length" icon="bell-off" :text="$t('profile.notifications.empty')" compact />

    <ul v-else class="notif-list">
      <li v-for="s in settings" :key="s.name" class="notif-row">
        <span class="notif-icon">
          <vue-feather :type="iconFor(s.icon)" size="18"></vue-feather>
        </span>
        <label class="notif-text" :for="'notif-' + s.name">
          <span class="notif-title">{{ channelTitle(s.name) }}</span>
          <span class="notif-desc">{{ channelDesc(s.name) }}</span>
        </label>
        <span v-if="saving === s.name" class="spinner sm notif-spinner"></span>
        <label class="switch">
          <input
            :id="'notif-' + s.name"
            type="checkbox"
            :checked="s.isEnabled"
            :disabled="!!saving"
            @change="toggle(s, $event.target.checked, $event)"
          />
          <span class="switch-track"></span>
        </label>
      </li>
    </ul>
  </div>
</template>

<script>
import feather from 'feather-icons';
import EmptyState from '@/components/ui/EmptyState.vue';
import {
  isPushSupported,
  getNotificationPermission,
  enablePushNotifications,
  disablePushNotifications,
  MOBILE_NOTIFICATION_CHANNEL,
} from '@/services/firebase.service';

export default {
  name: 'ProfileNotifications',
  components: { EmptyState },
  data() {
    return {
      loading: false,
      loadError: false,
      saving: null,
      pushSupported: false,
      pushPermission: getNotificationPermission(),
      pushBusy: false,
    };
  },
  computed: {
    settings() {
      return this.$store.state.notifications.settings;
    },
  },
  async mounted() {
    this.load();
    this.pushSupported = await isPushSupported();
  },
  methods: {
    iconFor(icon) {
      return icon && feather.icons[icon] ? icon : 'bell';
    },
    // Channel names are keys (e.g. "Email"); show a translated title when one exists.
    channelTitle(name) {
      const key = `profile.notifications.channels.${name}.title`;
      return this.$te(key) ? this.$t(key) : name;
    },
    channelDesc(name) {
      const key = `profile.notifications.channels.${name}.desc`;
      return this.$te(key) ? this.$t(key) : this.$t('profile.notifications.defaultDesc');
    },
    async enablePush() {
      this.pushBusy = true;
      try {
        const { status, channelEnabled } = await enablePushNotifications();
        this.pushPermission = getNotificationPermission();
        if (status === 'granted') {
          // The service switched the mobile notification channel on; reflect it in the list.
          if (channelEnabled) {
            this.$store.dispatch('notifications/markEnabled', { name: MOBILE_NOTIFICATION_CHANNEL, isEnabled: true });
          }
          this.$toast.success(this.$t('profile.notifications.browser.enabledToast'));
        }
      } catch {
        this.$toast.error(this.$t('profile.notifications.browser.error'));
      } finally {
        this.pushBusy = false;
      }
    },
    async load() {
      this.loading = true;
      this.loadError = false;
      const ok = await this.$store.dispatch('notifications/load', { force: true });
      this.loading = false;
      this.loadError = !ok;
    },
    async toggle(setting, value, event) {
      this.saving = setting.name;
      const isMobile = setting.name === MOBILE_NOTIFICATION_CHANNEL;
      // Turning the channel on also registers this browser. Ask for permission first, while the
      // click still counts as a user gesture. Best effort: the setting is saved either way, since it
      // also applies to the mobile app.
      if (isMobile && value && this.pushSupported && this.pushPermission !== 'denied') {
        try {
          await enablePushNotifications({ syncChannel: false });
        } catch {
          this.$toast.error(this.$t('profile.notifications.browser.error'));
        }
        this.pushPermission = getNotificationPermission();
      }
      const ok = await this.$store.dispatch('notifications/setEnabled', { name: setting.name, isEnabled: value });
      if (ok && isMobile && !value) await disablePushNotifications();
      this.saving = null;
      if (ok) {
        this.$toast.success(this.$t('profile.notifications.saved'));
      } else {
        // The store reverted the value; make the checkbox follow it.
        if (event?.target) event.target.checked = setting.isEnabled;
        this.$toast.error(this.$t('profile.notifications.saveError'));
      }
    },
  },
};
</script>

<style scoped>
.notif-list {
  display: flex;
  flex-direction: column;
}

.notif-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
}

.notif-row + .notif-row {
  border-top: 1px solid var(--border);
}

.notif-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: var(--primary-soft);
  color: var(--primary);
}

.notif-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.notif-title {
  font-size: 14px;
  font-weight: 600;
}

.notif-desc {
  font-size: 12.5px;
  color: var(--text-3);
}

.push-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  background: var(--surface-2);
}

.notif-icon.push-default { background: var(--surface-3); color: var(--text-2); }
.notif-icon.push-denied { background: var(--danger-soft); color: var(--danger); }

.notif-spinner {
  color: var(--text-3);
}
</style>
