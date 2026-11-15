<template>
  <div class="app-shell">
    <app-sidebar />
    <div class="app-main">
      <app-topbar />
      <main class="app-content">
        <notification-nudge />
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
    <mobile-nav />
    <global-modals />
    <in-app-notification-host />
  </div>
</template>

<script>
import AppSidebar from './AppSidebar.vue';
import AppTopbar from './AppTopbar.vue';
import MobileNav from './MobileNav.vue';
import GlobalModals from './GlobalModals.vue';
import NotificationNudge from '@/components/notifications/NotificationNudge.vue';
import InAppNotificationHost from '@/components/notifications/InAppNotificationHost.vue';
import authService from '@/services/auth.service';
import { refreshPushToken, onForegroundMessage, showSystemNotification } from '@/services/firebase.service';
import { pushInAppNotification, fromFcmPayload } from '@/plugins/inAppNotifications';

export default {
  name: 'AppLayout',
  components: {
    AppSidebar, AppTopbar, MobileNav, GlobalModals, NotificationNudge, InAppNotificationHost,
  },
  mounted() {
    this.loadReferenceData();
    // Fire-and-forget: stores the current language for users who never changed it.
    authService.syncActiveLanguageOnce(this.$i18n.locale);
    document.addEventListener('keydown', this.onKeydown);
    this.setupPush();
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.onKeydown);
    if (this.unsubscribePush) this.unsubscribePush();
  },
  methods: {
    // No-op unless FCM is configured (VAPID key) and permission was granted earlier.
    async setupPush() {
      refreshPushToken().catch(() => {});
      this.unsubscribePush = await onForegroundMessage((payload) => {
        const notification = fromFcmPayload(payload);
        if (!notification.title && !notification.body) return;
        // Stays on screen until closed, so it is still there when the user returns to the tab.
        pushInAppNotification(notification);
        // FCM doesn't show an OS notification while the app is open; if this tab is in the
        // background, show one ourselves so the message isn't missed.
        if (document.visibilityState !== 'visible') showSystemNotification(notification);
      });
    },
    async loadReferenceData() {
      try {
        await this.$store.dispatch('dashboard/loadCurrencies');
      } catch {
        this.$toast.error(this.$t('common.messages.currenciesLoadError'));
      }
      try {
        await this.$store.dispatch('dashboard/loadLabels');
      } catch {
        this.$toast.error(this.$t('common.messages.notebookLabelsLoadError'));
      }
    },
    onKeydown(e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target?.tagName || '').toLowerCase();
      if (['input', 'textarea', 'select'].includes(tag) || e.target?.isContentEditable) return;
      if (this.$store.state.ui.modal.type) return;
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        this.$store.dispatch('ui/openModal', { type: 'transaction', mode: 'create' });
      }
    },
  },
};
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
}

.app-main {
  margin-left: var(--sidebar-w);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-content {
  flex: 1;
  min-width: 0;
  overflow-x: clip;
}

@media (max-width: 1023px) {
  .app-main {
    margin-left: 0;
    padding-bottom: calc(var(--mobile-nav-h) + env(safe-area-inset-bottom));
  }
}

.page-enter-active,
.page-leave-active {
  transition: opacity 0.16s var(--ease), transform 0.16s var(--ease);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.page-leave-to {
  opacity: 0;
}
</style>
