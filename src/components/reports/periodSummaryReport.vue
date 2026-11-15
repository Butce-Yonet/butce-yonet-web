<template>
  <div class="summary card">
    <template v-if="loading && !summary">
      <div v-for="i in 3" :key="i" class="stat">
        <div class="skeleton" style="height: 12px; width: 40%"></div>
        <div class="skeleton" style="height: 26px; width: 70%; margin-top: 6px"></div>
        <div class="skeleton" style="height: 10px; width: 50%; margin-top: 6px"></div>
      </div>
    </template>

    <template v-else-if="summary">
      <div v-for="card in cards" :key="card.key" class="stat" :class="{ 'is-loading': loading }">
        <div class="stat-label">
          <span class="stat-icon" :class="card.tone">
            <vue-feather :type="card.icon" size="15"></vue-feather>
          </span>
          {{ card.label }}
        </div>
        <div class="stat-value" :class="card.valueClass">{{ money(card.value) }}</div>
        <div class="stat-foot">
          <span v-if="card.change != null" class="trend" :class="card.trendClass">
            <vue-feather :type="card.change >= 0 ? 'trending-up' : 'trending-down'" size="12"></vue-feather>
            {{ Math.abs(card.change).toFixed(1) }}%
          </span>
          <span class="truncate">{{ $t('summaryExtra.vsPrevious', { amount: money(card.previous) }) }}</span>
        </div>
      </div>
    </template>

    <empty-state v-else icon="bar-chart-2" :text="$t('reports.periodSummary.noData')" compact class="summary-empty" />
  </div>
</template>

<script>
import EmptyState from '@/components/ui/EmptyState.vue';
import reportService from '@/services/report.service';
import { formatMoney, toStartOfDayISO, toEndOfDayISO } from '@/utils/format';

export default {
  name: 'PeriodSummaryReport',
  components: { EmptyState },
  props: {
    range: { type: Array, default: () => [null, null] },
    currencyId: { type: [Number, String], default: null },
  },
  emits: ['loaded'],
  data() {
    return { summary: null, loading: false, debounce: null, reqId: 0 };
  },
  computed: {
    code() {
      return this.summary?.currency?.code;
    },
    cards() {
      const s = this.summary;
      if (!s) return [];
      const trend = (v, higherIsGood) => {
        if (v == null || v === 0) return 'flat';
        return (v > 0) === higherIsGood ? 'good' : 'bad';
      };
      return [
        {
          key: 'income',
          label: this.$t('reports.periodSummary.income'),
          icon: 'arrow-down-left',
          tone: 'tone-income',
          value: s.totalIncome,
          previous: s.previousTotalIncome,
          change: s.incomeChangePercent,
          trendClass: trend(s.incomeChangePercent, true),
        },
        {
          key: 'expense',
          label: this.$t('reports.periodSummary.expense'),
          icon: 'arrow-up-right',
          tone: 'tone-expense',
          value: s.totalExpense,
          previous: s.previousTotalExpense,
          change: s.expenseChangePercent,
          trendClass: trend(s.expenseChangePercent, false),
        },
        {
          key: 'net',
          label: this.$t('reports.periodSummary.netBalance'),
          icon: 'activity',
          tone: 'tone-net',
          value: s.netBalance,
          previous: s.previousNetBalance,
          change: s.netBalanceChangePercent,
          trendClass: trend(s.netBalanceChangePercent, true),
          valueClass: s.netBalance < 0 ? 'neg' : 'pos',
        },
      ];
    },
    version() {
      return this.$store.state.ui.versions.transactions;
    },
  },
  watch: {
    range() { this.queue(); },
    currencyId() { this.queue(); },
    version() { this.load(); },
  },
  mounted() {
    this.load();
  },
  methods: {
    money(v) {
      return formatMoney(v, this.code);
    },
    queue() {
      clearTimeout(this.debounce);
      this.debounce = setTimeout(() => this.load(), 250);
    },
    async load() {
      const id = ++this.reqId;
      this.loading = true;
      try {
        const [start, end] = this.range || [];
        const res = await reportService.getPeriodSummary({
          CurrencyId: this.currencyId ?? null,
          StartDate: toStartOfDayISO(start),
          EndDate: toEndOfDayISO(end),
        });
        if (id !== this.reqId) return;
        this.summary = res.status === 200 ? res.data.data : null;
        this.$emit('loaded', this.summary);
      } catch {
        if (id === this.reqId) this.summary = null;
      } finally {
        if (id === this.reqId) this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.summary .stat + .stat {
  border-left: 1px solid var(--border);
}

.summary-empty {
  grid-column: 1 / -1;
}

.tone-income { background: var(--income-soft); color: var(--income); }
.tone-expense { background: var(--expense-soft); color: var(--expense); }
.tone-net { background: var(--info-soft); color: var(--info); }

.stat-value.neg { color: var(--expense); }

.is-loading {
  opacity: 0.6;
  transition: opacity 0.15s;
}

@media (max-width: 767px) {
  .summary {
    grid-template-columns: 1fr 1fr;
  }

  .summary .stat:nth-child(3) {
    grid-column: 1 / -1;
    border-left: 0;
    border-top: 1px solid var(--border);
  }
}

@media (max-width: 420px) {
  .summary {
    grid-template-columns: 1fr;
  }

  .summary .stat + .stat {
    border-left: 0;
    border-top: 1px solid var(--border);
  }
}
</style>
