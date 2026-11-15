<template>
  <div class="card">
    <div class="card-head">
      <div class="card-title">{{ $t('reports.detailed.title') }}</div>
      <div class="row">
        <div v-if="viewMode === 'chart'" class="segmented sm">
          <button
            v-for="ct in chartTypes"
            :key="ct.key"
            type="button"
            :class="{ active: chartType === ct.key }"
            :aria-label="ct.label"
            v-tooltip="ct.label"
            @click="chartType = ct.key"
          >
            <vue-feather :type="ct.icon" size="14"></vue-feather>
          </button>
        </div>
        <div class="segmented sm">
          <button type="button" :class="{ active: viewMode === 'chart' }" v-tooltip="$t('reports.detailed.chartView')" @click="viewMode = 'chart'">
            <vue-feather type="bar-chart-2" size="14"></vue-feather>
          </button>
          <button type="button" :class="{ active: viewMode === 'table' }" v-tooltip="$t('reports.detailed.tableView')" @click="viewMode = 'table'">
            <vue-feather type="list" size="14"></vue-feather>
          </button>
        </div>
      </div>
    </div>

    <div class="toolbar dr-toolbar">
      <div class="segmented sm">
        <button type="button" :class="{ active: activeTab === 'categorized' }" @click="activeTab = 'categorized'">
          {{ $t('reports.detailed.categorizedTab') }}
        </button>
        <button type="button" :class="{ active: activeTab === 'noncategorized' }" @click="activeTab = 'noncategorized'">
          {{ $t('reports.detailed.nonCategorizedTab') }}
        </button>
      </div>
      <div class="segmented sm">
        <button
          v-for="opt in typeOptions"
          :key="opt.value"
          type="button"
          :class="{ active: transactionType === opt.value }"
          @click="transactionType = opt.value"
        >{{ opt.text }}</button>
      </div>
      <div v-if="activeTab === 'categorized'" class="dr-label">
        <label-select v-model="labelId" :multiple="false" small :placeholder="$t('reportsExtra.allLabels')" />
      </div>
    </div>

    <div class="card-body dr-body">
      <div v-if="loading" class="loading-box"><span class="spinner lg"></span></div>

      <empty-state v-else-if="!currentItems.length" icon="inbox" :text="$t('reports.detailed.noData')" compact />

      <template v-else-if="viewMode === 'table'">
        <div class="table-wrap">
          <table class="dr-table">
            <thead>
              <tr>
                <th>{{ $t('reports.detailed.table.term') }}</th>
                <th v-if="activeTab === 'categorized'">{{ $t('reports.detailed.table.label') }}</th>
                <th v-else>{{ $t('reports.detailed.table.currency') }}</th>
                <th class="num">{{ $t('reports.detailed.table.amount') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in currentItems" :key="i">
                <td class="term">{{ formatTerm(item.term) }}</td>
                <td v-if="activeTab === 'categorized'">
                  <span
                    v-if="item.userLabel"
                    class="chip"
                    :style="{ background: soft(item.userLabel.colorCode), color: item.userLabel.colorCode }"
                  >
                    <i class="dot"></i><span>{{ item.userLabel.name }}</span>
                  </span>
                  <span v-else class="muted">{{ $t('transactionList.noLabel') }}</span>
                </td>
                <td v-else>
                  <span class="badge">{{ item.currency?.code }}</span>
                  <span class="muted cur-name">{{ item.currency?.name }}</span>
                </td>
                <td class="num amount">{{ money(item.amount, item.currency?.code) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <div v-else class="chart-box dr-chart">
        <canvas ref="chartCanvas"></canvas>
      </div>
    </div>
  </div>
</template>

<script>
import { Chart } from 'chart.js/auto';
import moment from 'moment';
import EmptyState from '@/components/ui/EmptyState.vue';
import LabelSelect from '@/components/ui/LabelSelect.vue';
import reportService from '@/services/report.service';
import { formatMoney, softColor, toStartOfDayISO, toEndOfDayISO } from '@/utils/format';
import { CHART_PALETTE, OTHER_COLOR, themeColors, baseTooltip } from '@/utils/chart';

const SMALL_THRESHOLD = 3; // percent

export default {
  name: 'DetailedReport',
  components: { EmptyState, LabelSelect },
  props: {
    range: { type: Array, default: () => [null, null] },
    currencyId: { type: [Number, String], default: null },
  },
  data() {
    return {
      activeTab: 'categorized',
      viewMode: 'chart',
      chartType: 'bar',
      transactionType: 1,
      labelId: null,
      categorizedItems: [],
      nonCategorizedItems: [],
      loading: false,
      debounce: null,
      chartInstance: null,
      reqId: 0,
    };
  },
  computed: {
    chartTypes() {
      return [
        { key: 'bar', icon: 'bar-chart-2', label: this.$t('reports.detailed.chartTypes.bar') },
        { key: 'doughnut', icon: 'pie-chart', label: this.$t('reports.detailed.chartTypes.doughnut') },
      ];
    },
    typeOptions() {
      return [
        { value: 1, text: this.$t('common.expense') },
        { value: 0, text: this.$t('common.income') },
        { value: 2, text: this.$t('common.saving') },
      ];
    },
    currentItems() {
      return this.activeTab === 'categorized' ? this.categorizedItems : this.nonCategorizedItems;
    },
    theme() {
      return this.$store.state.ui.theme;
    },
  },
  watch: {
    activeTab() { this.load(); },
    range() { this.queue(); },
    currencyId() { this.queue(); },
    transactionType() { this.queue(); },
    labelId() { this.queue(); },
    viewMode() { this.$nextTick(() => this.refreshChart()); },
    chartType() { this.$nextTick(() => this.refreshChart()); },
    theme() { this.$nextTick(() => this.refreshChart()); },
  },
  mounted() {
    this.load();
  },
  beforeUnmount() {
    this.destroyChart();
  },
  methods: {
    soft(c) {
      return softColor(c, '1f');
    },
    money(v, code) {
      return formatMoney(v, code);
    },
    formatTerm(term) {
      if (!term) return '—';
      return moment(term).locale(this.$i18n.locale).format('MMMM YYYY');
    },
    queue() {
      clearTimeout(this.debounce);
      this.debounce = setTimeout(() => this.load(), 250);
    },
    dateParams() {
      const [start, end] = this.range || [];
      return { StartDate: toStartOfDayISO(start), EndDate: toEndOfDayISO(end) };
    },
    async load() {
      const id = ++this.reqId;
      this.loading = true;
      this.destroyChart();
      try {
        if (this.activeTab === 'categorized') {
          const res = await reportService.getCategorizedTransactionReport({
            CurrencyId: this.currencyId ?? null,
            TransactionTypes: this.transactionType,
            NotebookLabelId: this.labelId ?? null,
            ...this.dateParams(),
          });
          if (id !== this.reqId) return;
          this.categorizedItems = res.status === 200 ? (res.data.data || []) : [];
        } else {
          const res = await reportService.getNonCategorizedTransactionReport({
            CurrencyId: this.currencyId ?? null,
            TransactionTypes: this.transactionType,
            ...this.dateParams(),
          });
          if (id !== this.reqId) return;
          this.nonCategorizedItems = res.status === 200 ? (res.data.data || []) : [];
        }
      } catch {
        if (id !== this.reqId) return;
        if (this.activeTab === 'categorized') this.categorizedItems = [];
        else this.nonCategorizedItems = [];
      } finally {
        if (id === this.reqId) {
          this.loading = false;
          this.$nextTick(() => this.refreshChart());
        }
      }
    },

    // Groups raw items into series, folding tiny (<3%) groups into "Other".
    buildGroups(items, keyFn, colorFn, currencyFn) {
      const map = {};
      items.forEach((item) => {
        const key = keyFn(item);
        if (!map[key]) {
          map[key] = { label: key, color: colorFn(item, Object.keys(map).length), currencyCode: currencyFn(item), total: 0, data: {} };
        }
        const amt = item.amount || 0;
        map[key].total += amt;
        map[key].data[item.term] = (map[key].data[item.term] || 0) + amt;
      });

      const groups = Object.values(map).sort((a, b) => b.total - a.total);
      const grand = groups.reduce((s, g) => s + g.total, 0);
      const main = [];
      let otherTotal = 0;
      let otherCurrency = '';
      const otherData = {};
      groups.forEach((g) => {
        if (grand > 0 && (g.total / grand) * 100 < SMALL_THRESHOLD) {
          otherTotal += g.total;
          otherCurrency = g.currencyCode;
          Object.entries(g.data).forEach(([term, amt]) => {
            otherData[term] = (otherData[term] || 0) + amt;
          });
        } else {
          main.push(g);
        }
      });
      if (otherTotal > 0) {
        main.push({ label: this.$t('common.other'), color: OTHER_COLOR, currencyCode: otherCurrency, total: otherTotal, data: otherData });
      }
      return { groups: main, grand };
    },

    destroyChart() {
      if (this.chartInstance) {
        this.chartInstance.destroy();
        this.chartInstance = null;
      }
    },

    refreshChart() {
      this.destroyChart();
      if (this.viewMode !== 'chart' || this.loading) return;
      const canvas = this.$refs.chartCanvas;
      const items = this.currentItems;
      if (!canvas || !items.length) return;

      const categorized = this.activeTab === 'categorized';
      const { groups, grand } = this.buildGroups(
        items,
        (item) => (categorized ? (item.userLabel?.name || this.$t('transactionList.noLabel')) : (item.currency?.code || '?')),
        (item, rank) => (categorized && item.userLabel?.colorCode) || CHART_PALETTE[rank % CHART_PALETTE.length],
        (item) => item.currency?.code || '',
      );
      const currencyCode = groups[0]?.currencyCode || '';
      const isDoughnut = this.chartType === 'doughnut';
      const colors = themeColors();

      let data;
      let datasets;
      if (isDoughnut) {
        datasets = [{
          data: groups.map((g) => g.total),
          backgroundColor: groups.map((g) => g.color),
          borderColor: colors.surface,
          borderWidth: 2,
          hoverOffset: 6,
        }];
        data = { labels: groups.map((g) => g.label), datasets };
      } else {
        const terms = [...new Set(items.map((i) => i.term))].sort();
        datasets = groups.map((g) => ({
          label: g.label,
          data: terms.map((t) => g.data[t] || 0),
          backgroundColor: g.color,
          borderRadius: 4,
          maxBarThickness: 36,
          currencyCode: g.currencyCode,
          stack: 'total',
        }));
        data = { labels: terms.map((t) => this.formatTerm(t)), datasets };
      }

      const options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 300 },
        plugins: {
          legend: {
            position: isDoughnut ? 'right' : 'bottom',
            labels: {
              color: colors.text2,
              font: { family: colors.font, size: 12 },
              boxWidth: 10,
              boxHeight: 10,
              usePointStyle: true,
              pointStyle: 'rectRounded',
              padding: 12,
            },
          },
          tooltip: {
            ...baseTooltip(colors),
            callbacks: {
              label: (ctx) => {
                if (isDoughnut) {
                  const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                  const pct = total > 0 ? Math.round((ctx.parsed / total) * 100) : 0;
                  return ` ${ctx.label}: ${this.money(ctx.parsed, currencyCode)} (${pct}%)`;
                }
                const ds = datasets[ctx.datasetIndex];
                return ` ${ds.label}: ${this.money(ctx.parsed.y, ds.currencyCode || currencyCode)}`;
              },
            },
          },
        },
      };
      if (isDoughnut) {
        options.cutout = '64%';
      } else {
        options.scales = {
          x: {
            stacked: true,
            grid: { display: false },
            border: { display: false },
            ticks: { color: colors.text3, font: { family: colors.font, size: 11 } },
          },
          y: {
            stacked: true,
            border: { display: false },
            grid: { color: colors.border },
            ticks: {
              color: colors.text3,
              font: { family: colors.font, size: 11 },
              callback: (v) => formatMoney(v, currencyCode, { compact: true }),
            },
          },
        };
      }

      const plugins = [];
      if (isDoughnut) {
        const label = this.$t('common.total');
        const value = this.money(grand, currencyCode);
        plugins.push({
          id: 'doughnutCenter',
          afterDraw(chart) {
            const { ctx, chartArea } = chart;
            if (!chartArea) return;
            const cx = (chartArea.left + chartArea.right) / 2;
            const cy = (chartArea.top + chartArea.bottom) / 2;
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `600 11px ${colors.font}`;
            ctx.fillStyle = colors.text3;
            ctx.fillText(label.toUpperCase(), cx, cy - 11);
            ctx.font = `700 14px ${colors.font}`;
            ctx.fillStyle = colors.text;
            ctx.fillText(value, cx, cy + 9);
            ctx.restore();
          },
        });
      }

      this.chartInstance = new Chart(canvas, { type: isDoughnut ? 'doughnut' : 'bar', data, options, plugins });
    },
  },
};
</script>

<style scoped>
.dr-toolbar {
  background: var(--surface-2);
}

.dr-label {
  min-width: 200px;
  flex: 1 1 200px;
  max-width: 280px;
}

.dr-body {
  min-height: 320px;
}

.dr-chart {
  height: 340px;
}

.table-wrap {
  overflow-x: auto;
  margin: -8px -20px;
}

.dr-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13.5px;
}

.dr-table th {
  padding: 10px 20px;
  text-align: left;
  font-size: 12px;
  font-weight: 650;
  color: var(--text-3);
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}

.dr-table td {
  padding: 11px 20px;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
}

.dr-table tr:last-child td {
  border-bottom: 0;
}

.dr-table tbody tr:hover {
  background: var(--surface-2);
}

.dr-table .num {
  text-align: right;
}

.term {
  white-space: nowrap;
  color: var(--text-2);
  font-weight: 550;
  text-transform: capitalize;
}

.cur-name {
  margin-left: 6px;
  font-size: 12.5px;
}

@media (max-width: 600px) {
  .dr-label {
    max-width: none;
  }

  .dr-chart {
    height: 300px;
  }
}
</style>
