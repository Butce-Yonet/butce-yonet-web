<template>
  <div class="budget-summary" :class="{ compact }">
    <div v-for="s in items" :key="s.currency.id" class="bs-row" :class="{ clickable: link }" @click="go">
      <div class="bs-top">
        <span class="bs-label">
          <span class="badge">{{ s.currency.code }}</span>
          <span class="muted">{{ $t('budgets.summary.budgetCount', { n: s.budgetCount }, s.budgetCount) }}</span>
        </span>
        <span class="bs-pct tabular" :class="'text-' + tone(s)">%{{ pct(s) }}</span>
      </div>
      <div class="bs-amounts tabular">
        <strong>{{ money(s.totalSpent, s.currency) }}</strong>
        <span class="muted">/ {{ money(s.totalAmount, s.currency) }}</span>
      </div>
      <div class="progress" :class="{ sm: compact }">
        <div class="progress-fill" :class="'fill-' + tone(s)" :style="{ width: Math.min(100, ratio(s)) + '%' }"></div>
      </div>
      <div class="bs-counts">
        <span><i class="dot success"></i>{{ $t('budgets.summary.onTrack', { n: s.onTrackCount }) }}</span>
        <span><i class="dot warning"></i>{{ $t('budgets.summary.warning', { n: s.warningCount }) }}</span>
        <span><i class="dot danger"></i>{{ $t('budgets.summary.exceeded', { n: s.exceededCount }) }}</span>
        <span v-if="!compact" class="bs-remaining">
          {{ $t('budgets.remaining', { amount: money(s.remainingAmount, s.currency) }) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { formatBudgetMoney, formatPercent } from '@/utils/budget';

export default {
  name: 'BudgetSummary',
  props: {
    items: { type: Array, default: () => [] },
    compact: { type: Boolean, default: false },
    link: { type: [String, Object], default: null },
  },
  methods: {
    money: formatBudgetMoney,
    ratio(s) {
      return s.totalAmount > 0 ? (s.totalSpent / s.totalAmount) * 100 : 0;
    },
    pct(s) {
      return formatPercent(this.ratio(s));
    },
    // Summary has no status of its own; reflect the worst budget in the group.
    tone(s) {
      if (s.exceededCount > 0) return 'danger';
      if (s.warningCount > 0) return 'warning';
      return 'success';
    },
    go() {
      if (this.link) this.$router.push(this.link);
    },
  },
};
</script>

<style scoped>
.budget-summary {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

.budget-summary.compact {
  grid-template-columns: minmax(0, 1fr);
  gap: 18px;
}

.bs-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 18px 20px;
  min-width: 0;
}

.compact .bs-row {
  padding: 0;
}

.bs-row.clickable {
  cursor: pointer;
}

.budget-summary:not(.compact) .bs-row + .bs-row {
  border-left: 1px solid var(--border);
}

.bs-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.bs-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
}

.bs-pct {
  font-size: 12.5px;
  font-weight: 700;
}

.bs-amounts {
  display: flex;
  align-items: baseline;
  gap: 6px;
  flex-wrap: wrap;
}

.bs-amounts strong {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.compact .bs-amounts strong {
  font-size: 16px;
}

.bs-counts {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  font-size: 12.5px;
  color: var(--text-2);
}

.bs-counts span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.bs-remaining {
  margin-left: auto;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot.success, .fill-success { background: var(--income) !important; }
.dot.warning, .fill-warning { background: var(--warning) !important; }
.dot.danger, .fill-danger { background: var(--danger) !important; }

.text-success { color: var(--income); }
.text-warning { color: var(--warning); }
.text-danger { color: var(--danger); }

@media (max-width: 640px) {
  .budget-summary:not(.compact) .bs-row + .bs-row {
    border-left: 0;
    border-top: 1px solid var(--border);
  }
}
</style>
