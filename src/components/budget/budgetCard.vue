<template>
  <div class="tile budget-card" :class="['tone-' + tone, { large, clickable: !!to }]" @click="go">
    <div class="tile-top">
      <span class="budget-avatar" :style="avatarStyle">
        <vue-feather :type="budget.isGeneral ? 'layers' : 'tag'" size="17"></vue-feather>
      </span>
      <div style="min-width: 0; flex: 1">
        <div class="tile-title" :title="title">{{ title }}</div>
        <div class="tile-sub">
          {{ period }} · <span :class="{ 'last-day': budget.daysLeft === 1 }">{{ daysLeftText }}</span>
        </div>
      </div>
      <div v-if="actions" class="tile-actions" @click.stop>
        <button type="button" class="btn-icon sm" v-tooltip="$t('common.tooltips.edit')" @click="$emit('edit', budget)">
          <vue-feather type="edit-2" size="15"></vue-feather>
        </button>
        <button type="button" class="btn-icon sm danger" v-tooltip="$t('common.tooltips.delete')" @click="$emit('delete', budget)">
          <vue-feather type="trash-2" size="15"></vue-feather>
        </button>
      </div>
    </div>

    <div class="budget-amounts">
      <span class="budget-spent tabular">{{ money(budget.spentAmount) }}</span>
      <span class="muted tabular">/ {{ money(budget.amount) }}</span>
    </div>

    <div class="budget-progress">
      <div class="progress" :class="{ lg: large }">
        <div class="progress-fill" :class="'fill-' + tone" :style="{ width: barWidth + '%' }"></div>
      </div>
      <span class="budget-pct tabular" :class="'text-' + tone">%{{ pct }}</span>
    </div>

    <div class="tile-foot">
      <span class="budget-foot" :class="{ ['text-' + tone]: isExceeded }">
        <vue-feather v-if="isExceeded" type="alert-circle" size="14"></vue-feather>
        {{ footText }}
      </span>
      <span class="badge" :class="tone">{{ statusText }}</span>
    </div>
  </div>
</template>

<script>
import {
  BUDGET_EXCEEDED, BUDGET_WARNING, budgetTone, formatBudgetMoney, formatBudgetPeriod, formatPercent,
} from '@/utils/budget';
import { softColor } from '@/utils/format';

export default {
  name: 'BudgetCard',
  props: {
    budget: { type: Object, required: true },
    actions: { type: Boolean, default: true },
    large: { type: Boolean, default: false },
    to: { type: [String, Object], default: null },
  },
  emits: ['edit', 'delete'],
  computed: {
    title() {
      return this.budget.isGeneral ? this.$t('budgets.general') : (this.budget.label?.name || '—');
    },
    tone() {
      return budgetTone(this.budget.status);
    },
    isExceeded() {
      return this.budget.status === BUDGET_EXCEEDED;
    },
    barWidth() {
      return Math.max(0, Math.min(this.budget.percentage || 0, 100));
    },
    pct() {
      return formatPercent(this.budget.percentage);
    },
    period() {
      return formatBudgetPeriod(this.budget.periodStart, this.budget.periodEnd);
    },
    daysLeftText() {
      const n = this.budget.daysLeft;
      if (n === 1) return this.$t('budgets.lastDay');
      return this.$t('budgets.daysLeft', { n }, n);
    },
    footText() {
      const b = this.budget;
      if (this.isExceeded) {
        return b.overAmount > 0
          ? this.$t('budgets.overBy', { amount: this.money(b.overAmount) })
          : this.$t('budgets.reachedLimit');
      }
      const remaining = this.$t('budgets.remaining', { amount: this.money(b.remainingAmount) });
      return `${remaining} · ${this.$t('budgets.dailyAllowance', { amount: this.money(b.dailyAllowance) })}`;
    },
    statusText() {
      if (this.budget.status === BUDGET_EXCEEDED) return this.$t('budgets.status.exceeded');
      if (this.budget.status === BUDGET_WARNING) return this.$t('budgets.status.warning');
      return this.$t('budgets.status.onTrack');
    },
    avatarStyle() {
      if (this.budget.isGeneral || !this.budget.label?.colorCode) return null;
      const c = this.budget.label.colorCode;
      return { color: c, background: softColor(c) };
    },
  },
  methods: {
    money(v) {
      return formatBudgetMoney(v, this.budget.currency);
    },
    go() {
      if (this.to) this.$router.push(this.to);
    },
  },
};
</script>

<style scoped>
.budget-card.clickable {
  cursor: pointer;
}

.budget-avatar {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: var(--primary-soft);
  color: var(--primary);
}

.budget-amounts {
  display: flex;
  align-items: baseline;
  gap: 6px;
  flex-wrap: wrap;
}

.budget-spent {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.large .budget-spent {
  font-size: 28px;
}

.budget-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.budget-progress .progress {
  flex: 1;
}

.progress.lg {
  height: 12px;
}

.fill-success { background: var(--income) !important; }
.fill-warning { background: var(--warning) !important; }
.fill-danger { background: var(--danger) !important; }

.text-success { color: var(--income); }
.text-warning { color: var(--warning); }
.text-danger { color: var(--danger); }

.budget-pct {
  font-size: 12.5px;
  font-weight: 700;
  min-width: 48px;
  text-align: right;
}

.budget-foot {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: var(--text-2);
  min-width: 0;
}

.budget-foot.text-danger {
  color: var(--danger);
  font-weight: 600;
}

.last-day {
  color: var(--warning);
  font-weight: 600;
}

.tone-danger {
  border-color: color-mix(in srgb, var(--danger) 35%, var(--border));
}
</style>
