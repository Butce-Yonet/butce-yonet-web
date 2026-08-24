<template>
  <div class="container-fluid pt-4">
    <!-- Tab bar -->
    <div class="tx-tab-bar mb-3">
      <button
        class="tx-tab"
        :class="{ active: activeTab === 0 }"
        @click="activeTab = 0"
      >
        <i class="fa fa-credit-card me-2"></i>
        {{ $t('transactionsPage.tabs.transactions') }}
      </button>
      <button
        class="tx-tab"
        :class="{ active: activeTab === 1 }"
        @click="activeTab = 1"
      >
        <i class="fa fa-repeat me-2"></i>
        {{ $t('transactionsPage.tabs.recurring') }}
      </button>
      <div class="tx-tab-indicator" :style="{ transform: `translateX(${activeTab * 100}%)` }"></div>
    </div>

    <!-- Slider -->
    <div class="tx-slider-outer">
      <div class="tx-slider-track" :style="{ transform: `translateX(-${activeTab * 50}%)` }">
        <div class="tx-slide">
          <transaction-list></transaction-list>
        </div>
        <div class="tx-slide">
          <recurring-transaction-list></recurring-transaction-list>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import transactionList from '@/components/transaction/transactionList.vue';
import recurringTransactionList from '@/components/recurringtransaction/recurringTransactionList.vue';
import currencyService from '@/services/currency.service';
import userLabelService from '@/services/user.label.service';

export default {
  components: {
    'transaction-list': transactionList,
    'recurring-transaction-list': recurringTransactionList,
  },
  data() {
    return {
      activeTab: 0,
    };
  },
  watch: {
    '$store.state.dashboard.openRecurringTransactionModalTrigger'() {
      this.activeTab = 1;
    },
    '$store.state.dashboard.pendingOpenRecurringTransactionModal': {
      immediate: true,
      handler(val) {
        if (val) this.activeTab = 1;
      }
    },
  },
  methods: {
    async getCurrencies() {
      try {
        const response = await currencyService.getCurrencies();
        this.$store.dispatch('dashboard/setCurrencies', response.data);
      } catch {
        this.$swal({ icon: 'error', title: this.$t('common.messages.currenciesLoadError') });
      }
    },
    async getNotebookLabels() {
      try {
        const response = await userLabelService.getUserLabels();
        this.$store.dispatch('dashboard/setLabels', response.data.data);
      } catch {
        this.$swal({ icon: 'error', title: this.$t('common.messages.notebookLabelsLoadError') });
      }
    },
  },
  async mounted() {
    await this.getCurrencies();
    await this.getNotebookLabels();
  },
};
</script>

<style scoped>
/* ── Tab bar ─────────────────────────────────────────────────────── */
.tx-tab-bar {
  position: relative;
  display: inline-flex;
  background: #f3f4f6;
  border-radius: 12px;
  padding: 4px;
  gap: 2px;
}

.tx-tab {
  position: relative;
  z-index: 1;
  padding: 8px 20px;
  font-size: 13px;
  font-weight: 600;
  border: none;
  border-radius: 9px;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  transition: color 0.2s;
  white-space: nowrap;
  min-width: 140px;
  text-align: center;
}
.tx-tab.active {
  color: #111827;
}
.tx-tab i {
  font-size: 11px;
}

/* Sliding pill indicator */
.tx-tab-indicator {
  position: absolute;
  top: 4px;
  left: 4px;
  width: calc(50% - 5px);
  height: calc(100% - 8px);
  background: #fff;
  border-radius: 9px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

/* ── Slider ──────────────────────────────────────────────────────── */
.tx-slider-outer {
  overflow: hidden;
}

.tx-slider-track {
  display: flex;
  width: 200%;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  align-items: flex-start;
}

.tx-slide {
  width: 50%;
  flex-shrink: 0;
  min-width: 0;
}
</style>
