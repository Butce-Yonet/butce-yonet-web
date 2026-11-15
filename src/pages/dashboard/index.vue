<template>
  <div class="page">
    <div class="page-head dash-head">
      <div>
        <h2 class="greeting">{{ greeting }}</h2>
        <p class="page-subtitle">{{ todayText }}</p>
      </div>
      <period-picker v-model="range" align="right" />
    </div>

    <div class="stack">
      <period-summary-report :range="range" />

      <div class="grid grid-main-side">
        <!-- Recent transactions -->
        <div class="card">
          <div class="card-head">
            <div class="card-title">{{ $t('dashboard.recentTransactions.title') }}</div>
            <router-link to="/transactions" class="link-btn">
              {{ $t('dashboard.recentTransactions.viewAll') }}
              <vue-feather type="arrow-right" size="14"></vue-feather>
            </router-link>
          </div>

          <div v-if="txLoading && !recent.length" class="skeleton-list">
            <div v-for="i in 5" :key="i" class="sk-row">
              <div class="skeleton" style="width: 38px; height: 38px; border-radius: 11px"></div>
              <div style="flex: 1; display: flex; flex-direction: column; gap: 6px">
                <div class="skeleton" style="height: 10px; width: 55%"></div>
                <div class="skeleton" style="height: 10px; width: 30%"></div>
              </div>
            </div>
          </div>

          <empty-state
            v-else-if="!recent.length"
            icon="inbox"
            :title="$t('dashboard.recentTransactions.empty')"
            :text="$t('dashExtra.firstTransactionHint')"
          >
            <button type="button" class="btn btn-primary btn-sm" @click="openCreate">
              <vue-feather type="plus" size="15"></vue-feather>
              {{ $t('header.newTransaction') }}
            </button>
          </empty-state>

          <div v-else>
            <div
              v-for="tx in recent"
              :key="tx.id"
              class="list-row clickable"
              tabindex="0"
              @click="openEdit(tx)"
              @keydown.enter="openEdit(tx)"
            >
              <span class="tx-avatar" :class="tone(tx.transactionType)">
                <vue-feather :type="icon(tx.transactionType)" size="17"></vue-feather>
              </span>
              <div class="row-main">
                <div class="row-title">{{ tx.name }}</div>
                <div class="row-meta">
                  <span>{{ relative(tx.transactionDate) }}</span>
                  <label-chips :labels="tx.labels" :max="2" />
                </div>
              </div>
              <span class="amount" :class="tone(tx.transactionType)">
                {{ sign(tx.transactionType) }}{{ money(tx.amount, tx.currency?.code) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Category breakdown -->
        <div class="card">
          <div class="card-head">
            <div class="card-title">{{ $t('dashboard.categoryChart.title') }}</div>
            <div class="segmented sm">
              <button type="button" :class="{ active: chartPage === 0 }" @click="switchPage(0)">{{ $t('dashboard.categoryChart.expense') }}</button>
              <button type="button" :class="{ active: chartPage === 1 }" @click="switchPage(1)">{{ $t('dashboard.categoryChart.income') }}</button>
            </div>
          </div>

          <div class="card-body">
            <div v-if="chartLoading" class="loading-box"><span class="spinner lg"></span></div>
            <empty-state v-else-if="!currentChartData.length" icon="pie-chart" :text="$t('dashboard.categoryChart.empty')" compact />
            <div v-else class="donut-wrap">
              <div class="donut">
                <canvas ref="donutCanvas"></canvas>
                <div class="donut-center">
                  <span class="donut-label">{{ $t('common.total') }}</span>
                  <span class="donut-value tabular">{{ money(chartTotal, chartCurrency, true) }}</span>
                </div>
              </div>
              <ul class="legend">
                <li v-for="item in currentChartData" :key="item.label" class="legend-row">
                  <span class="label-dot" :style="{ background: item.color }"></span>
                  <span class="legend-name truncate">{{ item.label }}</span>
                  <span class="legend-pct tabular">%{{ item.pct }}</span>
                  <span class="legend-val tabular">{{ money(item.amount, item.currencyCode) }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-2">
        <!-- Upcoming bills -->
        <div class="card">
          <div class="card-head">
            <div class="card-title">{{ $t('dashExtra.upcomingBills') }}</div>
            <router-link to="/subscriptions" class="link-btn">
              {{ $t('dashboard.recentTransactions.viewAll') }}
              <vue-feather type="arrow-right" size="14"></vue-feather>
            </router-link>
          </div>
          <div v-if="billsLoading" class="loading-box"><span class="spinner lg"></span></div>
          <empty-state v-else-if="!bills.length" icon="check-circle" :text="$t('dashExtra.noUpcomingBills')" compact />
          <div v-else>
            <div v-for="b in bills" :key="b.id" class="list-row">
              <span class="tx-avatar sm" :class="b.status === 'Overdue' ? 'expense' : 'neutral'">
                <vue-feather type="file-text" size="15"></vue-feather>
              </span>
              <div class="row-main">
                <div class="row-title">{{ b.name }}</div>
                <div class="row-meta" :class="{ late: b.status === 'Overdue' }">{{ dueText(b.nextOccurrence) }}</div>
              </div>
              <span class="amount">{{ b.amount == null ? '—' : money(b.amount, b.currency?.code) }}</span>
              <button type="button" class="btn-icon sm bordered" v-tooltip="$t('subscriptionExtra.markPaid')" @click="pay(b)">
                <vue-feather type="check" size="15"></vue-feather>
              </button>
            </div>
          </div>
        </div>

        <!-- Goals -->
        <div class="card">
          <div class="card-head">
            <div class="card-title">{{ $t('dashExtra.goalsInProgress') }}</div>
            <router-link to="/goals" class="link-btn">
              {{ $t('dashboard.recentTransactions.viewAll') }}
              <vue-feather type="arrow-right" size="14"></vue-feather>
            </router-link>
          </div>
          <div v-if="goalsLoading" class="loading-box"><span class="spinner lg"></span></div>
          <empty-state v-else-if="!goals.length" icon="target" :text="$t('dashExtra.noGoals')" compact>
            <button type="button" class="btn btn-secondary btn-sm" @click="$store.dispatch('ui/openModal', { type: 'goal' })">
              <vue-feather type="plus" size="14"></vue-feather>
              {{ $t('goalList.addButton') }}
            </button>
          </empty-state>
          <div v-else class="card-body goals-body">
            <div v-for="g in goals" :key="g.id" class="goal-row">
              <div class="goal-top">
                <span class="goal-name truncate">{{ g.name }}</span>
                <span class="goal-pct tabular">%{{ Math.round(g.progressPercent || 0) }}</span>
              </div>
              <div class="progress sm">
                <div class="progress-fill saving-fill" :style="{ width: Math.min(100, g.progressPercent || 0) + '%' }"></div>
              </div>
              <div class="goal-bottom">
                <span class="tabular">{{ money(g.currentAmount, g.currency?.code) }} / {{ money(g.targetAmount, g.currency?.code) }}</span>
                <button type="button" class="link-btn" @click="contribute(g)">
                  <vue-feather type="plus" size="13"></vue-feather>
                  {{ $t('goalList.tooltips.contribute') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Chart } from 'chart.js/auto';
import moment from 'moment';
import PeriodPicker from '@/components/ui/PeriodPicker.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import LabelChips from '@/components/ui/LabelChips.vue';
import PeriodSummaryReport from '@/components/reports/periodSummaryReport.vue';
import transactionService from '@/services/transaction.service';
import reportService from '@/services/report.service';
import subscriptionService from '@/services/subscription.service';
import goalService from '@/services/goal.service';
import { getDefaultDateRange } from '@/composables/dateRangePresets';
import { computeSubscriptionStatus } from '@/composables/subscriptionStatus';
import {
  formatMoney, formatRelative, formatDate, txTone, txIcon, txSign, toStartOfDayISO, toEndOfDayISO,
} from '@/utils/format';
import { CHART_PALETTE, OTHER_COLOR, themeColors, baseTooltip } from '@/utils/chart';

export default {
  name: 'DashboardPage',
  components: { PeriodPicker, EmptyState, LabelChips, PeriodSummaryReport },
  data() {
    return {
      range: getDefaultDateRange(),
      recent: [],
      txLoading: false,
      chartPage: 0,
      chartLoading: false,
      expenseCategories: [],
      incomeCategories: [],
      chartInstance: null,
      chartDebounce: null,
      bills: [],
      billsLoading: false,
      goals: [],
      goalsLoading: false,
    };
  },
  computed: {
    user() {
      return this.$store.getters['user/getCurrentUser'] || {};
    },
    greeting() {
      const h = new Date().getHours();
      const key = h < 6 ? 'night' : h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening';
      const first = (this.user.name || '').trim().split(/\s+/)[0];
      return first ? this.$t(`dashExtra.greeting.${key}`, { name: first }) : this.$t(`dashExtra.greetingNoName.${key}`);
    },
    todayText() {
      return moment().locale(this.$i18n.locale).format('D MMMM YYYY, dddd');
    },
    currentChartData() {
      return this.chartPage === 0 ? this.expenseCategories : this.incomeCategories;
    },
    chartTotal() {
      return this.currentChartData.reduce((s, d) => s + d.amount, 0);
    },
    chartCurrency() {
      return this.currentChartData[0]?.currencyCode || '';
    },
    versions() {
      return this.$store.state.ui.versions;
    },
    theme() {
      return this.$store.state.ui.theme;
    },
  },
  watch: {
    range() {
      clearTimeout(this.chartDebounce);
      this.chartDebounce = setTimeout(() => this.loadCategoryData(), 250);
    },
    'versions.transactions'() {
      this.loadRecent();
      this.loadCategoryData();
    },
    'versions.subscriptions'() {
      this.loadBills();
    },
    'versions.goals'() {
      this.loadGoals();
    },
    theme() {
      this.$nextTick(() => this.refreshChart());
    },
  },
  mounted() {
    this.loadRecent();
    this.loadCategoryData();
    this.loadBills();
    this.loadGoals();
  },
  beforeUnmount() {
    clearTimeout(this.chartDebounce);
    if (this.chartInstance) this.chartInstance.destroy();
  },
  methods: {
    money(v, code, compact = false) {
      return formatMoney(v, code, compact ? { compact: v >= 100000 } : {});
    },
    tone: txTone,
    icon: txIcon,
    sign: txSign,
    relative: formatRelative,
    dueText(d) {
      if (!d) return '—';
      const days = moment(d).startOf('day').diff(moment().startOf('day'), 'days');
      if (days < 0) return this.$t('subscriptionExtra.daysLate', { n: Math.abs(days) }, Math.abs(days));
      if (days === 0) return this.$t('common.today');
      if (days === 1) return this.$t('common.tomorrow');
      return `${formatDate(d, 'D MMM')} · ${this.$t('subscriptionExtra.inDays', { n: days }, days)}`;
    },
    openCreate() {
      this.$store.dispatch('ui/openModal', { type: 'transaction', mode: 'create' });
    },
    openEdit(tx) {
      if (tx.transactionType === 2) {
        this.$toast.info(this.$t('transactionList.savingLocked'));
        return;
      }
      this.$store.dispatch('ui/openModal', { type: 'transaction', mode: 'edit', data: tx });
    },
    pay(b) {
      this.$store.dispatch('ui/openModal', { type: 'subscriptionPay', data: b });
    },
    contribute(g) {
      this.$store.dispatch('ui/openModal', { type: 'goalContribute', data: g });
    },
    async loadRecent() {
      this.txLoading = true;
      try {
        const res = await transactionService.getAllTransactions({
          PageNumber: 1,
          PageSize: 7,
          SortColumn: '',
          SortDirection: 'Descending',
          LabelIds: [],
        });
        this.recent = res.status === 200 ? res.data.data.items || [] : [];
      } catch {
        this.recent = [];
      } finally {
        this.txLoading = false;
      }
    },
    async loadBills() {
      this.billsLoading = true;
      try {
        const res = await subscriptionService.getAllSubscriptions({ PageNumber: 1, PageSize: 50, SortColumn: '', SortDirection: 'Ascending' });
        const items = res.status === 200 ? res.data.data.items || [] : [];
        this.bills = items
          .map((s) => ({ ...s, status: computeSubscriptionStatus(s) }))
          .filter((s) => s.status === 'Overdue' || s.status === 'Upcoming')
          .sort((a, b) => new Date(a.nextOccurrence) - new Date(b.nextOccurrence))
          .slice(0, 5);
      } catch {
        this.bills = [];
      } finally {
        this.billsLoading = false;
      }
    },
    async loadGoals() {
      this.goalsLoading = true;
      try {
        const res = await goalService.getAllGoals({ PageNumber: 1, PageSize: 4, IsCompleted: false });
        this.goals = res.status === 200 ? res.data.data.items || [] : [];
      } catch {
        this.goals = [];
      } finally {
        this.goalsLoading = false;
      }
    },
    async loadCategoryData() {
      this.destroyChart();
      this.chartLoading = true;
      try {
        const [start, end] = this.range || [];
        const base = { StartDate: toStartOfDayISO(start), EndDate: toEndOfDayISO(end) };
        const [expRes, incRes] = await Promise.all([
          reportService.getCategorizedTransactionReport({ ...base, TransactionTypes: 1 }),
          reportService.getCategorizedTransactionReport({ ...base, TransactionTypes: 0 }),
        ]);
        this.expenseCategories = this.mapCategories(expRes.status === 200 ? expRes.data.data : []);
        this.incomeCategories = this.mapCategories(incRes.status === 200 ? incRes.data.data : []);
      } catch {
        this.expenseCategories = [];
        this.incomeCategories = [];
      } finally {
        this.chartLoading = false;
      }
      await this.$nextTick();
      this.refreshChart();
    },
    mapCategories(items) {
      if (!items || !items.length) return [];
      const groups = {};
      items.forEach((item) => {
        const name = item.userLabel?.name || this.$t('dashboard.categoryChart.noLabel');
        const key = `${name}_${item.currency?.code || ''}`;
        if (!groups[key]) {
          groups[key] = {
            label: name,
            color: item.userLabel?.colorCode || CHART_PALETTE[Object.keys(groups).length % CHART_PALETTE.length],
            amount: 0,
            currencyCode: item.currency?.code || '',
          };
        }
        groups[key].amount += item.amount || 0;
      });

      const sorted = Object.values(groups).sort((a, b) => b.amount - a.amount);
      const total = sorted.reduce((s, g) => s + g.amount, 0);
      const main = [];
      let otherAmount = 0;
      let otherCurrency = '';
      sorted.forEach((g) => {
        const pct = total > 0 ? (g.amount / total) * 100 : 0;
        if (pct >= 3) main.push(g);
        else {
          otherAmount += g.amount;
          otherCurrency = g.currencyCode;
        }
      });
      if (otherAmount > 0) {
        main.push({ label: this.$t('common.other'), color: OTHER_COLOR, amount: otherAmount, currencyCode: otherCurrency });
      }
      return main.map((g) => ({ ...g, pct: total > 0 ? Math.round((g.amount / total) * 100) : 0 }));
    },
    destroyChart() {
      if (this.chartInstance) {
        this.chartInstance.destroy();
        this.chartInstance = null;
      }
    },
    refreshChart() {
      this.destroyChart();
      const data = this.currentChartData;
      const canvas = this.$refs.donutCanvas;
      if (!data.length || !canvas) return;
      const colors = themeColors();
      this.chartInstance = new Chart(canvas, {
        type: 'doughnut',
        data: {
          labels: data.map((d) => d.label),
          datasets: [{
            data: data.map((d) => d.amount),
            backgroundColor: data.map((d) => d.color),
            borderWidth: 2,
            borderColor: colors.surface,
            hoverOffset: 6,
          }],
        },
        options: {
          cutout: '70%',
          responsive: true,
          maintainAspectRatio: true,
          animation: { duration: 400 },
          plugins: {
            legend: { display: false },
            tooltip: {
              ...baseTooltip(colors),
              callbacks: {
                label: (ctx) => {
                  const item = data[ctx.dataIndex];
                  return ` %${item.pct} · ${formatMoney(item.amount, item.currencyCode)}`;
                },
              },
            },
          },
        },
      });
    },
    async switchPage(page) {
      this.chartPage = page;
      await this.$nextTick();
      this.refreshChart();
    },
  },
};
</script>

<style scoped>
.dash-head {
  align-items: center;
}

.greeting {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

@media (max-width: 767px) {
  .greeting {
    font-size: 19px;
  }
}

.skeleton-list {
  padding: 8px 0;
}

.sk-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
}

.donut-wrap {
  display: flex;
  align-items: center;
  gap: 24px;
}

.donut {
  position: relative;
  width: 168px;
  flex-shrink: 0;
}

.donut-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  text-align: center;
  padding: 0 28px;
}

.donut-label {
  font-size: 11px;
  font-weight: 650;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-3);
}

.donut-value {
  font-size: 15px;
  font-weight: 700;
  line-height: 1.2;
  word-break: break-word;
}

.legend {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 220px;
  overflow-y: auto;
}

.legend-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.legend-name {
  flex: 1;
  min-width: 0;
  color: var(--text-2);
  font-weight: 550;
}

.legend-pct {
  color: var(--text-3);
  font-size: 12px;
  font-weight: 600;
}

.legend-val {
  font-weight: 650;
  white-space: nowrap;
}

@media (max-width: 1100px) and (min-width: 520px) {
  .donut-wrap {
    gap: 32px;
  }
}

@media (max-width: 519px) {
  .donut-wrap {
    flex-direction: column;
    align-items: stretch;
  }

  .donut {
    align-self: center;
  }

  .legend {
    max-height: none;
  }
}

.late {
  color: var(--danger);
  font-weight: 600;
}

.goals-body {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.goal-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.goal-top,
.goal-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.goal-name {
  font-weight: 600;
  font-size: 14px;
}

.goal-pct {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--saving);
}

.goal-bottom {
  font-size: 12.5px;
  color: var(--text-3);
}

.saving-fill {
  background: var(--saving);
}
</style>
