<template>
  <div class="card">
    <div class="card-head">
      <div>
        <div class="card-title">{{ $t('reports.categorySpending.title') }}</div>
        <div v-if="report && report.items?.length" class="card-subtitle">
          {{ $t('reports.categorySpending.total') }}:
          <strong class="tabular text-2">{{ money(report.generalTotalAmount) }}</strong>
        </div>
      </div>
    </div>

    <div v-if="loading && !report" class="loading-box"><span class="spinner lg"></span></div>

    <div v-else-if="report && report.items && report.items.length" class="card-body cs-list" :class="{ 'is-loading': loading }">
      <div v-for="(item, index) in sortedItems" :key="index" class="cs-item">
        <div class="cs-top">
          <span class="cs-name">
            <span class="label-dot" :style="{ background: color(index) }"></span>
            <span class="truncate">{{ item.categoryName || $t('transactionList.noLabel') }}</span>
          </span>
          <span class="cs-amount tabular">{{ money(item.amount) }}</span>
        </div>
        <div class="cs-bar">
          <div class="cs-fill" :style="{ width: Math.max(2, item.percentage) + '%', background: color(index) }"></div>
        </div>
        <div class="cs-meta">
          <span class="tabular">%{{ item.percentage.toFixed(1) }}</span>
          <span v-if="item.previousAmount != null && item.previousAmount > 0" class="trend" :class="item.amount <= item.previousAmount ? 'good' : 'bad'">
            <vue-feather :type="item.amount <= item.previousAmount ? 'trending-down' : 'trending-up'" size="11"></vue-feather>
            {{ Math.abs(((item.amount - item.previousAmount) / item.previousAmount) * 100).toFixed(0) }}%
          </span>
          <span v-if="item.previousAmount != null" class="muted truncate">
            {{ $t('reports.categorySpending.previousPeriod') }}: {{ money(item.previousAmount) }}
          </span>
        </div>
      </div>
    </div>

    <empty-state v-else icon="pie-chart" :text="$t('reports.categorySpending.noData')" compact />
  </div>
</template>

<script>
import EmptyState from '@/components/ui/EmptyState.vue';
import reportService from '@/services/report.service';
import { formatMoney, toStartOfDayISO, toEndOfDayISO } from '@/utils/format';
import { CHART_PALETTE } from '@/utils/chart';

export default {
  name: 'CategorySpendingReport',
  components: { EmptyState },
  props: {
    range: { type: Array, default: () => [null, null] },
    currencyId: { type: [Number, String], default: null },
  },
  data() {
    return { report: null, loading: false, debounce: null, reqId: 0 };
  },
  computed: {
    sortedItems() {
      return [...(this.report?.items || [])].sort((a, b) => b.amount - a.amount);
    },
  },
  watch: {
    range() { this.queue(); },
    currencyId() { this.queue(); },
  },
  mounted() {
    this.load();
  },
  methods: {
    color(i) {
      // Prefer the user's own label color so categories look the same everywhere.
      const name = this.sortedItems[i]?.categoryName;
      const label = name && this.$store.getters['dashboard/getLabels'].find((l) => l.name === name);
      return label?.colorCode || CHART_PALETTE[i % CHART_PALETTE.length];
    },
    money(v) {
      return formatMoney(v, this.report?.currency?.code);
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
        const res = await reportService.getCategorySpending({
          CurrencyId: this.currencyId ?? null,
          StartDate: toStartOfDayISO(start),
          EndDate: toEndOfDayISO(end),
        });
        if (id !== this.reqId) return;
        this.report = res.status === 200 ? res.data.data : null;
      } catch {
        if (id === this.reqId) this.report = null;
      } finally {
        if (id === this.reqId) this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.cs-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 520px;
  overflow-y: auto;
  transition: opacity 0.15s;
}

.cs-list.is-loading {
  opacity: 0.55;
}

.cs-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.cs-name {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  font-size: 13.5px;
  font-weight: 600;
}

.cs-amount {
  font-size: 13.5px;
  font-weight: 650;
  white-space: nowrap;
}

.cs-bar {
  height: 6px;
  margin: 8px 0 6px;
  border-radius: 6px;
  background: var(--surface-3);
  overflow: hidden;
}

.cs-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.5s var(--ease);
}

.cs-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-2);
  min-width: 0;
}
</style>
