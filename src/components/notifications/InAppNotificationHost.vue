<template>
  <Teleport to="body">
    <div class="ian-host" aria-live="assertive">
      <transition-group name="ian">
        <div
          v-for="n in items"
          :key="n.id"
          class="ian-card"
          :class="{ clickable: !!n.link }"
          role="alert"
          @click="open(n)"
        >
          <span class="ian-icon">
            <vue-feather type="bell" size="18"></vue-feather>
          </span>
          <div class="ian-text">
            <span class="ian-label">{{ $t('inAppNotification.label') }}</span>
            <span v-if="n.title" class="ian-title">{{ n.title }}</span>
            <span v-if="n.body" class="ian-body">{{ n.body }}</span>
            <span v-if="n.link" class="ian-open">
              {{ $t('inAppNotification.open') }}
              <vue-feather type="arrow-right" size="13"></vue-feather>
            </span>
          </div>
          <button
            type="button"
            class="ian-close"
            :aria-label="$t('common.close')"
            @click.stop="dismiss(n.id)"
          >
            <vue-feather type="x" size="16"></vue-feather>
          </button>
        </div>
      </transition-group>
    </div>
  </Teleport>
</template>

<script>
import { inAppNotificationState, dismissInAppNotification } from '@/plugins/inAppNotifications';

// Shows push messages that arrive while the app is open, at the top of the screen where they
// are hard to miss. They stay until the user closes or opens them.
export default {
  name: 'InAppNotificationHost',
  computed: {
    items() {
      return inAppNotificationState.items;
    },
  },
  methods: {
    dismiss: dismissInAppNotification,
    open(n) {
      if (!n.link) return;
      dismissInAppNotification(n.id);
      let url;
      try {
        url = new URL(n.link, window.location.origin);
      } catch {
        return;
      }
      if (url.origin === window.location.origin) {
        this.$router.push(url.pathname + url.search + url.hash).catch(() => {});
      } else {
        window.open(url.href, '_blank', 'noopener');
      }
    },
  },
};
</script>

<style scoped>
.ian-host {
  position: fixed;
  top: calc(var(--topbar-h) + 12px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 3100;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 420px;
  max-width: calc(100vw - 32px);
  pointer-events: none;
}

.ian-card {
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 12px 14px 14px;
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--border);
  border-left: 4px solid var(--primary);
  box-shadow: var(--shadow-lg);
}

.ian-card.clickable {
  cursor: pointer;
}

.ian-card.clickable:hover {
  background: var(--surface-2);
}

.ian-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: var(--primary-soft);
  color: var(--primary);
  animation: ian-ring 0.9s var(--ease) 0.15s 2;
}

.ian-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ian-label {
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--primary);
}

.ian-title {
  font-size: 14.5px;
  font-weight: 650;
}

.ian-body {
  font-size: 13px;
  color: var(--text-2);
  overflow-wrap: anywhere;
}

.ian-open {
  margin-top: 4px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--primary);
}

.ian-close {
  display: inline-flex;
  border: 0;
  background: transparent;
  color: var(--text-3);
  padding: 4px;
  border-radius: 6px;
}

.ian-close:hover {
  color: var(--text);
  background: var(--surface-3);
}

@keyframes ian-ring {
  0%, 100% { transform: rotate(0); }
  20% { transform: rotate(14deg); }
  40% { transform: rotate(-12deg); }
  60% { transform: rotate(8deg); }
  80% { transform: rotate(-4deg); }
}

.ian-enter-active,
.ian-leave-active {
  transition: all 0.25s var(--ease);
}

.ian-enter-from {
  opacity: 0;
  transform: translateY(-14px) scale(0.98);
}

.ian-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (prefers-reduced-motion: reduce) {
  .ian-icon { animation: none; }
}

@media (max-width: 767px) {
  .ian-host {
    top: calc(var(--topbar-h) + 8px + env(safe-area-inset-top));
    left: 16px;
    right: 16px;
    transform: none;
    width: auto;
    max-width: none;
  }
}
</style>
