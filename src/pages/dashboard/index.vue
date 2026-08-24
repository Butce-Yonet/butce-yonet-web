<template>
  <div class="container-fluid pt-4">
    <!-- Period Summary -->
    <div class="row mb-3">
      <div class="col-12">
        <period-summary-report></period-summary-report>
      </div>
    </div>

    <!-- Recent Transactions + Category Chart -->
    <div class="row g-3">
      <!-- Recent Transactions -->
      <div class="col-12 col-lg-6">
        <div class="card border dash-card">
          <div class="card-header d-flex align-items-center justify-content-between">
            <h5 class="mb-0">{{ $t('dashboard.recentTransactions.title') }}</h5>
            <router-link to="/transactions" class="view-all-link">
              {{ $t('dashboard.recentTransactions.viewAll') }}
              <i class="fa fa-chevron-right ms-1" style="font-size:10px"></i>
            </router-link>
          </div>
          <div class="card-body p-0">
            <div v-if="transactionsLoading" class="dash-state">
              <div class="spinner-border spinner-border-sm text-success"></div>
            </div>
            <div v-else-if="recentTransactions.length === 0" class="dash-state">
              <i class="fa fa-inbox text-muted" style="font-size:22px"></i>
              <span class="text-muted small">{{ $t('dashboard.recentTransactions.empty') }}</span>
            </div>
            <ul v-else class="tx-feed">
              <li v-for="tx in recentTransactions" :key="tx.id" class="tx-item">
                <div class="tx-icon" :class="tx.transactionType === 0 ? 'tx-income' : 'tx-expense'">
                  <i :class="tx.transactionType === 0 ? 'fa fa-arrow-up' : 'fa fa-arrow-down'"></i>
                </div>
                <div class="tx-body">
                  <div class="tx-name">{{ tx.name }}</div>
                  <div class="tx-meta">
                    <span class="tx-date">{{ formatDate(tx.transactionDate) }}</span>
                    <span v-if="tx.labels && tx.labels.length > 0" class="tx-labels">
                      <span
                        v-for="label in tx.labels.slice(0, 3)"
                        :key="label.id"
                        class="tx-label-badge"
                        :style="{ background: label.colorCode + '22', color: label.colorCode, borderColor: label.colorCode + '55' }"
                      >{{ label.name }}</span>
                    </span>
                  </div>
                </div>
                <div class="tx-amount" :class="tx.transactionType === 0 ? 'amount-up' : 'amount-down'">
                  {{ tx.transactionType === 0 ? '+' : '-' }}{{ formatCurrency(tx.amount, tx.currency?.code) }}
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Category Donut Chart -->
      <div class="col-12 col-lg-6">
        <div class="card border dash-card">
          <div class="card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
            <h5 class="mb-0">{{ $t('dashboard.categoryChart.title') }}</h5>
            <div class="chart-tabs">
              <button
                class="chart-tab-btn"
                :class="{ active: chartPage === 0 }"
                @click="switchPage(0)"
              >
                <i class="fa fa-arrow-down me-1"></i>{{ $t('dashboard.categoryChart.expense') }}
              </button>
              <button
                class="chart-tab-btn"
                :class="{ active: chartPage === 1 }"
                @click="switchPage(1)"
              >
                <i class="fa fa-arrow-up me-1"></i>{{ $t('dashboard.categoryChart.income') }}
              </button>
            </div>
          </div>

          <!-- Date filter row -->
          <div class="chart-date-row">
            <date-range-preset-picker v-model="chartDateRange" />
            <div class="chart-datepicker">
              <VueDatePicker
                v-model="chartDateRange"
                range
                auto-apply
                :placeholder="$t('reports.filters.dateRange')"
                :enable-time-picker="false"
                :locale="dateLocale"
              />
            </div>
          </div>

          <div class="card-body d-flex flex-column">
            <div v-if="chartLoading" class="dash-state flex-grow-1">
              <div class="spinner-border spinner-border-sm text-success"></div>
            </div>
            <div v-else-if="currentChartData.length === 0" class="dash-state flex-grow-1">
              <i class="fa fa-chart-pie text-muted" style="font-size:28px"></i>
              <span class="text-muted small">{{ $t('dashboard.categoryChart.empty') }}</span>
            </div>
            <div v-else class="chart-inner flex-grow-1">
              <!-- Donut + center overlay -->
              <div class="chart-donut-wrap">
                <canvas ref="donutCanvas"></canvas>
                <div class="chart-center">
                  <span class="chart-center-label">{{ $t('common.total') }}</span>
                  <span class="chart-center-value">{{ formatCurrency(chartTotal, chartCurrency) }}</span>
                </div>
              </div>

              <!-- Legend -->
              <transition name="legend-fade" mode="out-in">
                <ul :key="chartPage" class="chart-legend">
                  <li v-for="item in currentChartData" :key="item.label" class="legend-row">
                    <div class="legend-top">
                      <span class="legend-dot" :style="{ background: item.color }"></span>
                      <span class="legend-name">{{ item.label }}</span>
                      <span class="legend-val">{{ formatCurrency(item.amount, item.currencyCode) }}</span>
                    </div>
                    <div class="legend-bar-track">
                      <div
                        class="legend-bar-fill"
                        :style="{ width: item.pct + '%', background: item.color }"
                      ></div>
                    </div>
                  </li>
                </ul>
              </transition>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { Chart } from 'chart.js/auto';
import periodSummaryReport from '@/components/reports/periodSummaryReport.vue';
import transactionService from '@/services/transaction.service';
import reportService from '@/services/report.service';
import moment from 'moment';
import { useDateLocale } from '@/composables/useDateLocale';
import { getDefaultDateRange } from '@/composables/dateRangePresets';
import DateRangePresetPicker from '@/components/common/DateRangePresetPicker.vue';

const PALETTE = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#14b8a6',
  '#0ea5e9', '#a78bfa', '#fb923c', '#4ade80', '#f472b6',
];

export default {
  setup() {
    const { dateLocale } = useDateLocale();
    return { dateLocale };
  },
  components: {
    'period-summary-report': periodSummaryReport,
    'date-range-preset-picker': DateRangePresetPicker,
  },
  data() {
    return {
      recentTransactions: [],
      transactionsLoading: false,

      chartPage: 0,
      chartLoading: false,
      chartDateRange: getDefaultDateRange(),
      chartDebounce: null,
      expenseCategories: [],
      incomeCategories: [],
      chartInstance: null,
    };
  },
  computed: {
    currentChartData() {
      return this.chartPage === 0 ? this.expenseCategories : this.incomeCategories;
    },
    chartTotal() {
      return this.currentChartData.reduce((s, d) => s + d.amount, 0);
    },
    chartCurrency() {
      return this.currentChartData[0]?.currencyCode || '';
    },
  },
  watch: {
    chartDateRange() {
      clearTimeout(this.chartDebounce);
      this.chartDebounce = setTimeout(() => this.loadCategoryData(), 400);
    },
  },
  methods: {
    async loadRecentTransactions() {
      this.transactionsLoading = true;
      try {
        const res = await transactionService.getAllTransactions({
          PageNumber: 1,
          PageSize: 10,
          SortColumn: '',
          SortDirection: 'Descending',
          LabelIds: [],
        });
        this.recentTransactions = res.status === 200 ? res.data.data.items : [];
      } catch {
        this.recentTransactions = [];
      } finally {
        this.transactionsLoading = false;
      }
    },
    async loadCategoryData() {
      if (this.chartInstance) { this.chartInstance.destroy(); this.chartInstance = null; }
      this.chartLoading = true;
      try {
        const [start, end] = this.chartDateRange || [];
        const startDate = start ? moment(start).startOf('day').toISOString() : null;
        const endDate   = end   ? moment(end).endOf('day').toISOString()     : null;

        const base = { StartDate: startDate, EndDate: endDate };
        const [expRes, incRes] = await Promise.all([
          reportService.getCategorizedTransactionReport({ ...base, TransactionTypes: 1 }),
          reportService.getCategorizedTransactionReport({ ...base, TransactionTypes: 0 }),
        ]);
        this.expenseCategories = this.mapCategories(expRes.status === 200 ? expRes.data.data : []);
        this.incomeCategories  = this.mapCategories(incRes.status === 200  ? incRes.data.data  : []);
      } catch {
        this.expenseCategories = [];
        this.incomeCategories  = [];
      } finally {
        this.chartLoading = false;
      }
      await this.$nextTick();
      this.refreshChart();
    },
    mapCategories(items) {
      if (!items || items.length === 0) return [];

      // Group by label + currency
      const groups = {};
      items.forEach((item, idx) => {
        const name = item.userLabel?.name || this.$t('dashboard.categoryChart.noLabel');
        const key  = name + '_' + (item.currency?.code || '');
        if (!groups[key]) {
          groups[key] = {
            label:        name,
            color:        item.userLabel?.colorCode || PALETTE[idx % PALETTE.length],
            amount:       0,
            currencyCode: item.currency?.code || '',
          };
        }
        groups[key].amount += item.amount || 0;
      });

      const sorted = Object.values(groups).sort((a, b) => b.amount - a.amount);
      const total  = sorted.reduce((s, g) => s + g.amount, 0);

      // Merge anything below 3% of total into "Diğer"
      const THRESHOLD = 3;
      const main  = [];
      let otherAmount = 0;
      let otherCurrency = '';

      sorted.forEach(g => {
        const pct = total > 0 ? (g.amount / total) * 100 : 0;
        if (pct >= THRESHOLD) {
          main.push(g);
        } else {
          otherAmount  += g.amount;
          otherCurrency = g.currencyCode;
        }
      });

      if (otherAmount > 0) {
        main.push({
          label:        this.$t('common.other'),
          color:        '#d1d5db',
          amount:       otherAmount,
          currencyCode: otherCurrency,
        });
      }

      return main.map(g => ({ ...g, pct: total > 0 ? Math.round((g.amount / total) * 100) : 0 }));
    },
    refreshChart() {
      if (this.chartInstance) { this.chartInstance.destroy(); this.chartInstance = null; }

      const data = this.currentChartData;
      if (data.length === 0) return;

      const canvas = this.$refs.donutCanvas;
      if (!canvas) return;

      this.chartInstance = new Chart(canvas, {
        type: 'doughnut',
        data: {
          labels: data.map(d => d.label),
          datasets: [{
            data:            data.map(d => d.amount),
            backgroundColor: data.map(d => d.color),
            borderWidth:     2,
            borderColor:     '#fff',
            hoverOffset:     6,
          }],
        },
        options: {
          cutout:      '65%',
          responsive:  true,
          maintainAspectRatio: true,
          animation:   { duration: 400 },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const item = data[ctx.dataIndex];
                  return ` ${item.pct}%  ${this.formatCurrency(item.amount, item.currencyCode)}`;
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
    formatDate(date) {
      return moment(date).locale(this.$i18n.locale).fromNow();
    },
    formatCurrency(amount, currencyCode) {
      if (amount == null) return '';
      const locale = this.$i18n?.locale || 'tr-TR';
      if (!currencyCode) {
        return new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
      }
      return new Intl.NumberFormat(locale, {
        style: 'currency', currency: currencyCode,
        minimumFractionDigits: 2, maximumFractionDigits: 2,
      }).format(amount);
    },
  },
  mounted() {
    Promise.all([this.loadRecentTransactions(), this.loadCategoryData()]);
  },
  unmounted() {
    if (this.chartInstance) { this.chartInstance.destroy(); this.chartInstance = null; }
  },
};
</script>

<style scoped>
/* ── Card shell ─────────────────────────────────────────────────── */
.dash-card {
  min-height: 420px;
  display: flex;
  flex-direction: column;
}
.dash-card .card-body {
  flex: 1;
}

/* ── Shared empty / loading state ───────────────────────────────── */
.dash-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 240px;
  color: #9ca3af;
}

/* ── Recent Transactions feed ───────────────────────────────────── */
.view-all-link {
  font-size: 12px;
  font-weight: 600;
  color: #10b981;
  text-decoration: none;
}
.view-all-link:hover { color: #059669; }

.tx-feed {
  list-style: none;
  margin: 0;
  padding: 0;
}

.tx-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 18px;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.12s;
}
.tx-item:last-child { border-bottom: none; }
.tx-item:hover { background: #f9fafb; }

.tx-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  flex-shrink: 0;
  color: #fff;
}
.tx-income  { background: linear-gradient(135deg, #10b981, #059669); }
.tx-expense { background: linear-gradient(135deg, #ef4444, #dc2626); }

.tx-body {
  flex: 1;
  min-width: 0;
}
.tx-name {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tx-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
}
.tx-date {
  font-size: 11px;
  color: #9ca3af;
}
.tx-labels {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.tx-label-badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 4px;
  border: 1px solid;
  white-space: nowrap;
  line-height: 1.6;
}

.tx-amount {
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
}
.amount-up   { color: #10b981; }
.amount-down { color: #ef4444; }

/* ── Category chart ─────────────────────────────────────────────── */
.chart-tabs {
  display: flex;
  gap: 4px;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 3px;
}
.chart-tab-btn {
  padding: 4px 11px;
  font-size: 12px;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
}
.chart-tab-btn.active {
  background: #fff;
  color: #111827;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.chart-tab-btn i { font-size: 10px; }
.chart-tab-btn.active i.fa-arrow-down { color: #ef4444; }
.chart-tab-btn.active i.fa-arrow-up   { color: #10b981; }

/* ── Date filter row ────────────────────────────────────────────── */
.chart-date-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  padding: 8px 16px;
  border-bottom: 1px solid #f3f4f6;
  background: #fafafa;
  gap: 6px;
}
.chart-date-row :deep(.date-preset-btn) {
  padding: 3px 9px;
  font-size: 11px;
}
.chart-datepicker {
  flex: 1;
  max-width: 240px;
}
.chart-datepicker :deep(.dp__input) {
  font-size: 12px;
  height: 28px;
  min-height: unset;
  padding-top: 3px;
  padding-bottom: 3px;
  border-color: #e5e7eb;
  border-radius: 7px;
}

/* ── Chart body ─────────────────────────────────────────────────── */
.chart-inner {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 20px;
}

/* Donut + overlay */
.chart-donut-wrap {
  position: relative;
  width: 160px;
  flex-shrink: 0;
}
.chart-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
  width: 96px;
}
.chart-center-label {
  display: block;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #9ca3af;
  margin-bottom: 2px;
}
.chart-center-value {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
  word-break: break-all;
}

/* Legend */
.chart-legend {
  flex: 1;
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.legend-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.legend-top {
  display: flex;
  align-items: center;
  gap: 6px;
}
.legend-dot {
  width: 9px;
  height: 9px;
  border-radius: 3px;
  flex-shrink: 0;
}
.legend-name {
  flex: 1;
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.legend-val {
  font-size: 12px;
  font-weight: 700;
  color: #111827;
  white-space: nowrap;
}
.legend-bar-track {
  height: 4px;
  border-radius: 2px;
  background: #f3f4f6;
  overflow: hidden;
}
.legend-bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.4s ease;
  opacity: 0.75;
}

/* ── Legend slide transition ────────────────────────────────────── */
.legend-fade-enter-active,
.legend-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.legend-fade-enter-from { opacity: 0; transform: translateX(12px); }
.legend-fade-leave-to   { opacity: 0; transform: translateX(-12px); }
</style>
