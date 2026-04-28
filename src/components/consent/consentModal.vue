<template>
  <Teleport to="body">
    <div v-if="hasPending" class="consent-overlay">
      <div class="consent-card">

        <div class="consent-header">
          <div>
            <h5 class="consent-title">{{ consentTitle }}</h5>
            <span class="consent-step-badge">{{ currentStep }} / {{ totalCount }}</span>
          </div>
        </div>

        <div class="consent-body" v-html="currentConsent.content"></div>

        <div class="consent-footer">
          <button class="btn-reject" @click="reject">
            <i class="fa fa-sign-out me-1"></i>
            {{ $t('consent.reject') }}
          </button>
          <button class="btn-accept" @click="accept" :disabled="accepting">
            <span v-if="accepting" class="spinner-border spinner-border-sm me-1"></span>
            <i v-else class="fa fa-check me-1"></i>
            {{ $t('consent.accept') }}
          </button>
        </div>

      </div>
    </div>
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
    hasPending()     { return this.$store.getters['consent/hasPending']; },
    currentConsent() { return this.$store.getters['consent/currentConsent']; },
    currentStep()    { return this.$store.getters['consent/currentStep']; },
    totalCount()     { return this.$store.getters['consent/totalCount']; },
    consentTitle() {
      if (!this.currentConsent) return '';
      return this.currentConsent.type === 1
        ? this.$t('consent.termsOfService')
        : this.$t('consent.privacyPolicy');
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
        }
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
  z-index: 9000;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  backdrop-filter: blur(2px);
}

.consent-card {
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 680px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.consent-header {
  padding: 20px 24px 16px;
  border-bottom: 1.5px solid #f3f4f6;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-shrink: 0;
}

.consent-title {
  font-size: 17px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 6px;
}

.consent-step-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  background: #f3f4f6;
  border-radius: 20px;
  padding: 2px 10px;
}

.consent-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  font-size: 14px;
  color: #374151;
  line-height: 1.7;
}

.consent-body :deep(h1) { font-size: 18px; font-weight: 700; margin-bottom: 12px; color: #111827; }
.consent-body :deep(h2) { font-size: 15px; font-weight: 700; margin: 16px 0 8px; color: #111827; }
.consent-body :deep(p)  { margin-bottom: 10px; }
.consent-body :deep(ul) { padding-left: 20px; margin-bottom: 10px; }
.consent-body :deep(li) { margin-bottom: 4px; }
.consent-body :deep(strong) { color: #111827; }

.consent-footer {
  padding: 16px 24px;
  border-top: 1.5px solid #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-shrink: 0;
  background: #fafafa;
}

.btn-reject {
  padding: 8px 18px;
  font-size: 13px;
  font-weight: 600;
  border: 1.5px solid #e5e7eb;
  border-radius: 9px;
  background: #fff;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-reject:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: #fef2f2;
}

.btn-accept {
  padding: 8px 22px;
  font-size: 13px;
  font-weight: 700;
  border: none;
  border-radius: 9px;
  background: #10b981;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.15s;
}
.btn-accept:hover:not(:disabled) { background: #059669; }
.btn-accept:disabled { opacity: 0.7; cursor: not-allowed; }
</style>
