<template>
  <div class="page">
    <div class="page-head">
      <router-link :to="{ name: 'budgets' }" class="link-btn">
        <vue-feather type="arrow-left" size="14"></vue-feather>
        {{ $t('budgets.backToList') }}
      </router-link>
      <div v-if="budget" class="page-actions">
        <button type="button" class="btn btn-secondary btn-sm" @click="openEdit">
          <vue-feather type="edit-2" size="14"></vue-feather>
          {{ $t('common.tooltips.edit') }}
        </button>
        <button type="button" class="btn btn-secondary btn-sm danger-text" @click="remove">
          <vue-feather type="trash-2" size="14"></vue-feather>
          {{ $t('common.tooltips.delete') }}
        </button>
      </div>
    </div>

    <div v-if="loading && !budget" class="loading-box"><span class="spinner lg"></span></div>

    <div v-else-if="notFound" class="card">
      <empty-state icon="search" :title="$t('budgets.errors.notFound')" :text="$t('budgets.notFoundText')">
        <router-link :to="{ name: 'budgets' }" class="btn btn-secondary btn-sm">{{ $t('budgets.backToList') }}</router-link>
      </empty-state>
    </div>

    <div v-else-if="loadError" class="card">
      <empty-state icon="wifi-off" :title="$t('budgets.errors.loadTitle')" :text="loadError">
        <button type="button" class="btn btn-secondary btn-sm" @click="load">
          <vue-feather type="refresh-cw" size="14"></vue-feather>
          {{ $t('budgets.retry') }}
        </button>
      </empty-state>
    </div>

    <div v-else-if="budget" class="stack">
      <budget-card :budget="budget" :actions="false" large />

      <div class="card">
        <div class="card-head">
          <div>
            <div class="card-title">{{ $t('budgets.detail.historyTitle') }}</div>
            <div class="card-subtitle">{{ $t('budgets.limitations.currentLimit') }}</div>
          </div>
          <div class="segmented sm">
            <button
              v-for="n in historyOptions"
              :key="n"
              type="button"
              :class="{ active: historyCount === n }"
              @click="setHistory(n)"
            >{{ $t('budgets.detail.periods', { n }) }}</button>
          </div>
        </div>
        <div class="card-body">
          <div class="chart-wrap" :class="{ 'is-loading': loading }">
            <canvas ref="chart"></canvas>
          </div>
          <div class="chart-legend">
            <span><i class="sw normal"></i>{{ $t('budgets.detail.legendSpent') }}</span>
            <span><i class="sw over"></i>{{ $t('budgets.detail.legendOver') }}</span>
            <span><i class="sw active"></i>{{ $t('budgets.detail.legendActive') }}</span>
            <span><i class="sw line"></i>{{ $t('budgets.detail.currentLimit') }}</span>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-body detail-foot">
          <div class="text-2">
            {{ $t('budgets.detail.periodStartsOn', { n: budget.periodStartDay }) }}
          </div>
          <router-link :to="transactionsLink" class="link-btn">
            {{ $t('budgets.detail.viewTransactions') }}
            <vue-feather type="arrow-right" size="14"></vue-feather>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Chart } from 'chart.js/auto';
import BudgetCard from '@/components/budget/budgetCard.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import budgetService from '@/services/budget.service';
import { confirmDelete } from '@/utils/confirm';
import { budgetErrorText } from '@/utils/budgetErrors';
import { budgetDayKey, formatBudgetMoney, parseBudgetDay } from '@/utils/budget';
import { themeColors, baseTooltip } from '@/utils/chart';
import { TX_EXPENSE } from '@/utils/format';

const HISTORY_KEY = 'budgetHistoryCount';

function readHistoryCount() {
  try {
    const n = Number(localStorage.getItem(HISTORY_KEY));
    return [3, 6, 12].includes(n) ? n : 6;
  } catch {
    return 6;
  }
}

export default {
  name: 'BudgetDetailPage',
  components: { BudgetCard, EmptyState },
  data() {
    return {
      budget: null,
      loading: false,
      notFound: false,
      loadError: '',
      historyCount: readHistoryCount(),
      historyOptions: [3, 6, 12],
      chart: null,
    };
  },
  computed: {
    id() {
      return Number(this.$route.params.id);
    },
    version() {
      return this.$store.state.ui.versions.budgets;
    },
    theme() {
      return this.$store.state.ui.theme;
    },
    transactionsLink() {
      const b = this.budget;
      const query = {
        type: String(TX_EXPENSE),
        currencyId: String(b.currency?.id ?? ''),
        start: budgetDayKey(b.periodStart),
        end: budgetDayKey(b.periodEnd),
      };
      if (!b.isGeneral && b.label?.id) query.labelIds = String(b.label.id);
      return { name: 'transactions', query };
    },
  },
  watch: {
    id() {
      this.budget = null;
      this.load();
    },
    version() {
      this.load();
    },
    theme() {
      this.$nextTick(() => this.renderChart());
    },
  },
  mounted() {
    this.load();
  },
  beforeUnmount() {
    this.destroyChart();
  },
  methods: {
    async load() {
      if (!this.id) {
        this.notFound = true;
        return;
      }
      this.loading = true;
      try {
        this.budget = await budgetService.get(this.id, this.historyCount);
        this.notFound = false;
        this.loadError = '';
        await this.$nextTick();
        this.renderChart();
      } catch (err) {
        if (err?.kind === 'unauthorized') return;
        if (err?.kind === 'notFound') {
          this.notFound = true;
          this.budget = null;
        } else {
          this.loadError = budgetErrorText(err);
        }
      } finally {
        this.loading = false;
      }
    },
    setHistory(n) {
      if (this.historyCount === n) return;
      this.historyCount = n;
      try {
        localStorage.setItem(HISTORY_KEY, String(n));
      } catch {
        // storage unavailable
      }
      this.load();
    },
    destroyChart() {
      if (this.chart) {
        this.chart.destroy();
        this.chart = null;
      }
    },
    renderChart() {
      this.destroyChart();
      const canvas = this.$refs.chart;
      const b = this.budget;
      if (!canvas || !b) return;
      const history = b.history || [];
      const colors = themeColors();
      const css = getComputedStyle(document.documentElement);
      const v = (name, fb) => (css.getPropertyValue(name) || '').trim() || fb;
      const primary = v('--primary', '#10b981');
      const danger = v('--danger', '#dc2626');
      const lastIdx = history.length - 1;
      const locale = this.$i18n.locale;

      const labels = history.map((p) => {
        const s = parseBudgetDay(p.periodStart).locale(locale);
        return b.periodStartDay === 1 ? s.format('MMM') : s.format('D MMM');
      });
      const barColors = history.map((p, i) => {
        const base = p.spentAmount > b.amount ? danger : primary;
        // Active period: lighter ("in progress").
        return i === lastIdx && /^#[0-9a-f]{6}$/i.test(base) ? base + '80' : base;
      });

      this.chart = new Chart(canvas, {
        data: {
          labels,
          datasets: [
            {
              type: 'bar',
              label: this.$t('budgets.detail.legendSpent'),
              data: history.map((p) => p.spentAmount),
              backgroundColor: barColors,
              borderRadius: 6,
              maxBarThickness: 40,
              order: 2,
            },
            {
              type: 'line',
              label: this.$t('budgets.detail.currentLimit'),
              data: history.map(() => b.amount),
              borderColor: colors.text2,
              borderDash: [6, 4],
              borderWidth: 1.5,
              pointRadius: 0,
              pointHoverRadius: 0,
              fill: false,
              order: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 300 },
          interaction: { mode: 'index', intersect: false },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: colors.text3, font: { family: colors.font } },
            },
            y: {
              beginAtZero: true,
              grid: { color: colors.border },
              border: { display: false },
              ticks: {
                color: colors.text3,
                font: { family: colors.font },
                callback: (val) => formatBudgetMoney(val, b.currency, 0),
              },
            },
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              ...baseTooltip(colors),
              callbacks: {
                title: (items) => {
                  const p = history[items[0].dataIndex];
                  const s = parseBudgetDay(p.periodStart).locale(locale).format('D MMM YYYY');
                  const e = parseBudgetDay(p.periodEnd).locale(locale).format('D MMM YYYY');
                  const suffix = items[0].dataIndex === lastIdx ? ` · ${this.$t('budgets.detail.legendActive')}` : '';
                  return `${s} – ${e}${suffix}`;
                },
                label: (ctx) => ` ${ctx.dataset.label}: ${formatBudgetMoney(ctx.raw, b.currency)}`,
              },
            },
          },
        },
      });
    },
    openEdit() {
      this.$store.dispatch('ui/openModal', { type: 'budget', mode: 'edit', data: this.budget });
    },
    async remove() {
      const b = this.budget;
      const name = b.isGeneral ? this.$t('budgets.general') : b.label?.name;
      const ok = await confirmDelete(this.$t('budgets.messages.areYouSureDelete', { name }));
      if (!ok) return;
      try {
        await budgetService.remove(b.id);
        this.$toast.success(this.$t('budgets.messages.deleteSuccess'));
      } catch (err) {
        if (err?.kind !== 'notFound') {
          this.$toast.error(budgetErrorText(err));
          return;
        }
      }
      this.$store.dispatch('ui/bump', 'budgets');
      this.$router.replace({ name: 'budgets' });
    },
  },
};
</script>

<style scoped>
.page-head {
  align-items: center;
}

.page-actions {
  display: flex;
  gap: 8px;
}

.danger-text {
  color: var(--danger);
}

.chart-wrap {
  position: relative;
  height: 260px;
}

.is-loading {
  opacity: 0.55;
  transition: opacity 0.15s;
}

.chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 16px;
  margin-top: 14px;
  font-size: 12.5px;
  color: var(--text-2);
}

.chart-legend span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.sw {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.sw.normal { background: var(--primary); }
.sw.over { background: var(--danger); }
.sw.active { background: var(--primary); opacity: 0.5; }
.sw.line {
  height: 0;
  border-top: 2px dashed var(--text-2);
  border-radius: 0;
}

.detail-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 13.5px;
}
</style>
