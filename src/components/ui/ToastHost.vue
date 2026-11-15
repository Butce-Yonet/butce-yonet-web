<template>
  <Teleport to="body">
    <div class="toast-host" aria-live="polite">
      <transition-group name="toast">
        <div v-for="t in items" :key="t.id" class="toast" :class="'toast-' + t.type" role="status">
          <span class="toast-icon">
            <vue-feather :type="iconFor(t.type)" size="16"></vue-feather>
          </span>
          <span class="toast-msg">{{ t.message }}</span>
          <button
            v-if="t.action"
            type="button"
            class="toast-action"
            @click="runAction(t)"
          >{{ t.action.label }}</button>
          <button type="button" class="toast-close" :aria-label="$t('common.close')" @click="dismiss(t.id)">
            <vue-feather type="x" size="14"></vue-feather>
          </button>
        </div>
      </transition-group>
    </div>
  </Teleport>
</template>

<script>
import { toastState, dismiss } from '@/plugins/toast';

export default {
  name: 'ToastHost',
  computed: {
    items() {
      return toastState.items;
    },
  },
  methods: {
    dismiss,
    iconFor(type) {
      if (type === 'success') return 'check';
      if (type === 'error') return 'alert-triangle';
      return 'info';
    },
    runAction(t) {
      t.action.handler?.();
      dismiss(t.id);
    },
  },
};
</script>

<style scoped>
.toast-host {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 3000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 360px;
  max-width: calc(100vw - 32px);
  pointer-events: none;
}

.toast {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 10px 10px 12px;
  border-radius: var(--radius);
  background: #0f172a;
  color: #f8fafc;
  box-shadow: var(--shadow-lg);
  font-size: 13.5px;
  font-weight: 500;
}

:root[data-theme='dark'] .toast {
  background: #1f2937;
  border: 1px solid #334155;
}

.toast-icon {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.toast-success .toast-icon { background: rgba(16, 185, 129, 0.2); color: #34d399; }
.toast-error .toast-icon { background: rgba(248, 113, 113, 0.2); color: #f87171; }
.toast-info .toast-icon { background: rgba(96, 165, 250, 0.2); color: #60a5fa; }

.toast-msg {
  flex: 1;
  min-width: 0;
}

.toast-action {
  border: 0;
  background: transparent;
  color: #34d399;
  font-weight: 650;
  font-size: 13px;
  padding: 4px 6px;
  border-radius: 6px;
}

.toast-action:hover {
  background: rgba(255, 255, 255, 0.08);
}

.toast-close {
  display: inline-flex;
  border: 0;
  background: transparent;
  color: #94a3b8;
  padding: 4px;
  border-radius: 6px;
}

.toast-close:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.22s var(--ease);
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

@media (max-width: 767px) {
  .toast-host {
    left: 16px;
    right: 16px;
    width: auto;
    max-width: none;
    bottom: calc(var(--mobile-nav-h) + 12px + env(safe-area-inset-bottom));
  }
}
</style>
