<template>
  <Teleport to="body">
    <transition name="modal">
      <div v-if="open" class="modal-root" @keydown.esc.stop="onEsc">
        <div class="modal-backdrop" @click="onBackdrop"></div>
        <div
          ref="dialog"
          class="modal-dialog"
          :class="'size-' + size"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
          tabindex="-1"
        >
          <header class="modal-head">
            <div v-if="icon" class="modal-icon" :class="'tone-' + tone">
              <vue-feather :type="icon" size="18"></vue-feather>
            </div>
            <div class="modal-titles">
              <p v-if="subtitle" class="modal-subtitle">{{ subtitle }}</p>
              <h2 class="modal-title">{{ title }}</h2>
            </div>
            <slot name="head-extra"></slot>
            <button type="button" class="btn-icon modal-close" :aria-label="$t('common.close')" @click="$emit('close')">
              <vue-feather type="x" size="18"></vue-feather>
            </button>
          </header>

          <div class="modal-body">
            <slot></slot>
          </div>

          <footer v-if="$slots.footer" class="modal-foot">
            <slot name="footer"></slot>
          </footer>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script>
let openCount = 0;

export default {
  name: 'AppModal',
  props: {
    open: { type: Boolean, default: false },
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    icon: { type: String, default: '' },
    tone: { type: String, default: 'brand' },
    size: { type: String, default: 'md' },
    persistent: { type: Boolean, default: false },
  },
  emits: ['close'],
  watch: {
    open: {
      immediate: true,
      handler(val, old) {
        if (val) {
          openCount++;
          document.body.style.overflow = 'hidden';
          this.$nextTick(() => {
            const el = this.$refs.dialog;
            if (!el) return;
            const first = el.querySelector('[autofocus], .modal-body input:not([type=hidden]):not([disabled])');
            (first || el).focus({ preventScroll: true });
          });
        } else if (old) {
          this.release();
        }
      },
    },
  },
  beforeUnmount() {
    if (this.open) this.release();
  },
  methods: {
    release() {
      openCount = Math.max(0, openCount - 1);
      if (openCount === 0) document.body.style.overflow = '';
    },
    onBackdrop() {
      if (!this.persistent) this.$emit('close');
    },
    onEsc() {
      if (!this.persistent) this.$emit('close');
    },
  },
};
</script>

<style scoped>
.modal-root {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.modal-backdrop {
  position: absolute;
  inset: 0;
  background: var(--overlay);
  backdrop-filter: blur(2px);
}

.modal-dialog {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: calc(100vh - 48px);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  outline: none;
}

.size-sm { max-width: 440px; }
.size-md { max-width: 560px; }
.size-lg { max-width: 720px; }

.modal-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 20px 0 24px;
}

.modal-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tone-brand { background: var(--primary-soft); color: var(--primary); }
.tone-income { background: var(--income-soft); color: var(--income); }
.tone-expense { background: var(--expense-soft); color: var(--expense); }
.tone-saving { background: var(--saving-soft); color: var(--saving); }
.tone-warning { background: var(--warning-soft); color: var(--warning); }
.tone-neutral { background: var(--surface-3); color: var(--text-2); }

.modal-titles {
  flex: 1;
  min-width: 0;
}

.modal-subtitle {
  font-size: 12.5px;
  color: var(--text-3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.modal-title {
  font-size: 17px;
  font-weight: 650;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.modal-close {
  align-self: flex-start;
  margin-top: -4px;
}

.modal-body {
  padding: 20px 24px 24px;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.modal-foot {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 14px 24px;
  border-top: 1px solid var(--border);
  background: var(--surface-2);
  border-radius: 0 0 var(--radius-xl) var(--radius-xl);
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s var(--ease);
}

.modal-enter-active .modal-dialog,
.modal-leave-active .modal-dialog {
  transition: transform 0.22s var(--ease), opacity 0.2s var(--ease);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-dialog,
.modal-leave-to .modal-dialog {
  transform: translateY(12px) scale(0.98);
  opacity: 0;
}

/* Mobile: bottom sheet */
@media (max-width: 640px) {
  .modal-root {
    align-items: flex-end;
    padding: 0;
  }

  .modal-dialog {
    max-width: none;
    max-height: calc(100vh - 32px);
    max-height: calc(100dvh - 32px);
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    border-bottom: 0;
  }

  .modal-dialog::before {
    content: '';
    position: absolute;
    top: 8px;
    left: 50%;
    width: 40px;
    height: 4px;
    margin-left: -20px;
    border-radius: 4px;
    background: var(--border-strong);
  }

  .modal-head {
    padding: 24px 16px 0 20px;
  }

  .modal-body {
    padding: 16px 20px 20px;
  }

  .modal-foot {
    padding: 12px 20px calc(12px + env(safe-area-inset-bottom));
    border-radius: 0;
  }

  .modal-foot :deep(.btn) {
    flex: 1;
  }

  .modal-foot :deep(.spacer) {
    display: none;
  }

  .modal-foot :deep(.btn-danger-ghost) {
    flex: 0 0 auto;
  }

  .modal-enter-from .modal-dialog,
  .modal-leave-to .modal-dialog {
    transform: translateY(100%);
    opacity: 1;
  }
}
</style>
