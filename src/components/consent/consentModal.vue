<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="hasPending" class="consent-overlay" role="dialog" aria-modal="true" :aria-label="consentTitle">
        <div class="consent-card">
          <header class="consent-head">
            <span class="consent-icon">
              <vue-feather :type="currentConsent.type === 4 ? 'gift' : 'shield'" size="18"></vue-feather>
            </span>
            <div class="consent-titles">
              <h2>{{ consentTitle }}</h2>
              <p v-if="totalCount > 1" class="muted">{{ $t('consentExtra.step', { current: currentStep, total: totalCount }) }}</p>
            </div>
          </header>

          <div v-if="totalCount > 1" class="consent-steps">
            <span v-for="i in totalCount" :key="i" :class="{ done: i < currentStep, active: i === currentStep }"></span>
          </div>

          <div class="consent-body" v-html="currentConsent.content"></div>

          <footer class="consent-foot">
            <button type="button" class="btn btn-ghost" @click="reject">
              <vue-feather type="log-out" size="15"></vue-feather>
              {{ $t('consent.reject') }}
            </button>
            <button type="button" class="btn btn-primary" :disabled="accepting" @click="accept">
              <span v-if="accepting" class="spinner sm"></span>
              <vue-feather v-else type="check" size="16"></vue-feather>
              {{ $t('consent.accept') }}
            </button>
          </footer>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script>
import authService from '@/services/auth.service';

export default {
  name: 'ConsentModal',
  data() {
    return { accepting: false };
  },
  computed: {
    hasPending() { return this.$store.getters['consent/hasPending']; },
    currentConsent() { return this.$store.getters['consent/currentConsent']; },
    currentStep() { return this.$store.getters['consent/currentStep']; },
    totalCount() { return this.$store.getters['consent/totalCount']; },
    consentTitle() {
      if (!this.currentConsent) return '';
      const titles = {
        1: 'consent.termsOfService',
        2: 'consent.privacyPolicy',
        4: 'consent.releaseNotes',
      };
      return this.$t(titles[this.currentConsent.type] || 'consent.privacyPolicy');
    },
  },
  methods: {
    async accept() {
      this.accepting = true;
      try {
        const { type, language } = this.currentConsent;
        const ok = await authService.acceptConsent(type, language);
        if (ok) {
          this.$store.dispatch('consent/acceptCurrent');
        } else {
          this.$toast.error(this.$t('consentExtra.acceptError'));
        }
      } catch {
        this.$toast.error(this.$t('consentExtra.acceptError'));
      } finally {
        this.accepting = false;
      }
    },
    reject() {
      authService.logout();
    },
  },
};
</script>

<style scoped>
.consent-overlay {
  position: fixed;
  inset: 0;
  z-index: 2500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--overlay);
  backdrop-filter: blur(4px);
}

.consent-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 640px;
  max-height: calc(100vh - 48px);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
}

.consent-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 22px 24px 14px;
}

.consent-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-soft);
  color: var(--primary);
  flex-shrink: 0;
}

.consent-titles h2 {
  font-size: 17px;
  font-weight: 650;
}

.consent-titles p {
  font-size: 12.5px;
}

.consent-steps {
  display: flex;
  gap: 6px;
  padding: 0 24px 14px;
}

.consent-steps span {
  flex: 1;
  height: 4px;
  border-radius: 4px;
  background: var(--surface-3);
}

.consent-steps span.done,
.consent-steps span.active {
  background: var(--primary);
}

.consent-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  font-size: 14px;
  line-height: 1.65;
  color: var(--text-2);
}

.consent-body :deep(h1),
.consent-body :deep(h2),
.consent-body :deep(h3) {
  margin: 16px 0 8px;
  font-size: 15px;
  color: var(--text);
}

.consent-body :deep(p) {
  margin: 0 0 10px;
}

.consent-body :deep(ul),
.consent-body :deep(ol) {
  margin: 0 0 10px;
  padding-left: 20px;
  list-style: disc;
}

.consent-foot {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 14px 24px;
}

@media (max-width: 640px) {
  .consent-overlay {
    padding: 0;
    align-items: flex-end;
  }

  .consent-card {
    max-height: 92vh;
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  }

  .consent-foot {
    padding-bottom: calc(14px + env(safe-area-inset-bottom));
  }

  .consent-foot .btn {
    flex: 1;
  }
}
</style>
