<template>
  <div v-if="visible" class="nudge-wrap">
    <div class="nudge" role="region" :aria-label="$t('notificationNudge.title')">
      <span class="nudge-icon">
        <vue-feather type="bell-off" size="20"></vue-feather>
      </span>
      <div class="nudge-text">
        <span class="nudge-title">{{ $t('notificationNudge.title') }}</span>
        <span class="nudge-desc">{{ description }}</span>
      </div>
      <div class="nudge-actions">
        <button type="button" class="btn btn-ghost btn-sm" :disabled="busy" @click="snooze">
          {{ $t('notificationNudge.later') }}
        </button>
        <router-link
          :to="{ path: '/profile', query: { tab: 'notifications' } }"
          class="btn btn-secondary btn-sm"
        >
          {{ $t('notificationNudge.settings') }}
        </router-link>
        <button type="button" class="btn btn-primary btn-sm" :disabled="busy" @click="enableAll">
          <span v-if="busy" class="spinner sm"></span>
          <vue-feather v-else type="bell" size="15"></vue-feather>
          {{ $t('notificationNudge.enable') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import {
  isPushSupported,
  getNotificationPermission,
  enablePushNotifications,
  MOBILE_NOTIFICATION_CHANNEL,
} from '@/services/firebase.service';

const EMAIL_CHANNEL = 'Email';
const SNOOZE_UNTIL_KEY = 'notification_nudge_snoozed_until';
const SNOOZE_COUNT_KEY = 'notification_nudge_snooze_count';
// Each "Not now" hides the banner a bit longer, but it always comes back while a channel is off.
const SNOOZE_DAYS = [1, 3, 7];
const DAY_MS = 24 * 60 * 60 * 1000;

function readStorage(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    if (value == null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, String(value));
  } catch {
    // storage unavailable: the banner simply shows again on the next visit
  }
}

// App-wide banner that keeps encouraging users to turn on email / mobile notifications
// (and to allow this browser) while any of them is off.
export default {
  name: 'NotificationNudge',
  data() {
    return {
      busy: false,
      pushSupported: false,
      pushPermission: getNotificationPermission(),
      snoozedUntil: Number(readStorage(SNOOZE_UNTIL_KEY)) || 0,
    };
  },
  computed: {
    ...mapState('notifications', ['settings', 'loaded']),
    emailOff() {
      return this.isOff(EMAIL_CHANNEL);
    },
    mobileOff() {
      return this.isOff(MOBILE_NOTIFICATION_CHANNEL);
    },
    // Mobile channel is on but this browser was never asked: pushes can't reach the web app yet.
    browserMissing() {
      return !this.mobileOff
        && !!this.settings.find((s) => s.name === MOBILE_NOTIFICATION_CHANNEL)
        && this.pushSupported
        && this.pushPermission === 'default';
    },
    description() {
      let key;
      if (this.emailOff && this.mobileOff) key = 'emailMobile';
      else if (this.emailOff) key = this.browserMissing ? 'emailBrowser' : 'email';
      else if (this.mobileOff) key = 'mobile';
      else key = 'browser';
      return `${this.$t('notificationNudge.text.' + key)} ${this.$t('notificationNudge.benefit')}`;
    },
    onSettingsPage() {
      return this.$route.path === '/profile' && this.$route.query.tab === 'notifications';
    },
    visible() {
      if (!this.loaded || this.onSettingsPage) return false;
      if (!this.emailOff && !this.mobileOff && !this.browserMissing) return false;
      return Date.now() >= this.snoozedUntil;
    },
  },
  async mounted() {
    this.$store.dispatch('notifications/load');
    this.pushSupported = await isPushSupported();
  },
  methods: {
    isOff(name) {
      const s = this.settings.find((x) => x.name === name);
      return !!s && !s.isEnabled;
    },
    snooze() {
      const count = Number(readStorage(SNOOZE_COUNT_KEY)) || 0;
      const days = SNOOZE_DAYS[Math.min(count, SNOOZE_DAYS.length - 1)];
      this.snoozedUntil = Date.now() + days * DAY_MS;
      writeStorage(SNOOZE_UNTIL_KEY, this.snoozedUntil);
      writeStorage(SNOOZE_COUNT_KEY, count + 1);
    },
    // Runs inside the click handler: the browser permission prompt needs a user gesture,
    // so the push request goes first, before any other awaited request.
    async enableAll() {
      this.busy = true;
      let ok = true;
      try {
        if (this.mobileOff || this.browserMissing) {
          ok = (await this.enableMobile()) && ok;
        }
        if (this.emailOff) {
          ok = (await this.$store.dispatch('notifications/setEnabled', { name: EMAIL_CHANNEL, isEnabled: true })) && ok;
        }
      } catch {
        ok = false;
      } finally {
        this.busy = false;
        this.pushPermission = getNotificationPermission();
      }
      if (ok) {
        writeStorage(SNOOZE_COUNT_KEY, null);
        this.$toast.success(this.$t('notificationNudge.enabledToast'));
      } else {
        this.$toast.error(this.$t('notificationNudge.error'));
      }
    },
    async enableMobile() {
      const canAskBrowser = this.pushSupported && this.pushPermission !== 'denied';
      if (canAskBrowser) {
        try {
          const { status, channelEnabled } = await enablePushNotifications();
          if (status === 'granted') {
            if (channelEnabled) {
              this.$store.dispatch('notifications/markEnabled', { name: MOBILE_NOTIFICATION_CHANNEL, isEnabled: true });
            }
            return channelEnabled;
          }
        } catch {
          // fall through: the channel still applies to the mobile app
        }
      }
      // Browser permission was refused/unavailable: still turn the channel on for the mobile app.
      if (!this.mobileOff) return true;
      return this.$store.dispatch('notifications/setEnabled', { name: MOBILE_NOTIFICATION_CHANNEL, isEnabled: true });
    },
  },
};
</script>

<style scoped>
.nudge-wrap {
  width: 100%;
  max-width: 1320px;
  margin: 0 auto;
  padding: 20px 28px 0;
}

.nudge {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border-radius: var(--radius-lg);
  background: var(--warning-soft);
  border: 1px solid color-mix(in srgb, var(--warning) 35%, transparent);
}

.nudge-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: var(--surface);
  color: var(--warning);
}

.nudge-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nudge-title {
  font-size: 14px;
  font-weight: 650;
  color: var(--text);
}

.nudge-desc {
  font-size: 12.5px;
  color: var(--text-2);
}

.nudge-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

@media (max-width: 767px) {
  .nudge-wrap {
    padding: 16px 16px 0;
  }

  .nudge {
    flex-wrap: wrap;
  }

  .nudge-actions {
    width: 100%;
    justify-content: flex-end;
    flex-wrap: wrap;
  }
}
</style>
