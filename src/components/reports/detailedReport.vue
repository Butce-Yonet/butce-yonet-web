<template>
    <div class="card border h-100">
        <div class="card-header d-flex align-items-center justify-content-between gap-2">
            <h5 class="mb-0">{{ $t('reports.detailed.title') }}</h5>
            <div class="d-flex align-items-center gap-2">
                <!-- Chart type selector — only in chart mode -->
                <transition name="fade-in">
                    <div v-if="viewMode === 'chart'" class="view-toggle">
                        <button
                            v-for="ct in chartTypes"
                            :key="ct.key"
                            class="view-toggle-btn has-tooltip"
                            :class="{ active: chartType === ct.key }"
                            @click="chartType = ct.key"
                            :data-tooltip="ct.label"
                        >
                            <i :class="'fa ' + ct.icon"></i>
                        </button>
                    </div>
                </transition>
                <!-- Table / Chart toggle -->
                <div class="view-toggle">
                    <button
                        class="view-toggle-btn"
                        :class="{ active: viewMode === 'table' }"
                        @click="setViewMode('table')"
                        :title="$t('reports.detailed.tableView')"
                    >
                        <i class="fa fa-table"></i>
                    </button>
                    <button
                        class="view-toggle-btn"
                        :class="{ active: viewMode === 'chart' }"
                        @click="setViewMode('chart')"
                        :title="$t('reports.detailed.chartView')"
                    >
                        <i class="fa fa-bar-chart"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- Shared filters -->
        <div class="detail-filters">
            <div class="mb-2">
                <date-range-preset-picker v-model="dateRange" />
            </div>
            <div class="row g-2 mb-2">
                <div class="col-12 col-sm-6">
                    <label class="filter-label">{{ $t('reports.filters.dateRange') }}</label>
                    <VueDatePicker v-model="dateRange" range auto-apply :placeholder="$t('reports.filters.dateRange')" :time-config="{ enableTimePicker: false }" :locale="dateLocale" />
                </div>
            </div>
            <div class="row g-2">
                <div class="col-12 col-sm-6 col-md-4">
                    <label class="filter-label">{{ $t('reports.filters.currency') }}</label>
                    <VSelect
                        v-model="currencyId"
                        :options="currencies"
                        label="code"
                        :reduce="c => c.id"
                        :placeholder="$t('common.all')"
                        :clearable="true"
                    >
                        <template #option="c">
                            <span class="fw-semibold">{{ c.code }}</span>
                            <span class="text-muted ms-1 small">{{ c.name }}</span>
                        </template>
                        <template #selected-option="c">{{ c.code }}</template>
                    </VSelect>
                </div>
                <div class="col-12 col-sm-6 col-md-4">
                    <label class="filter-label">{{ $t('reports.filters.transactionType') }}</label>
                    <select v-model="transactionType" class="form-select form-select-sm">
                        <option :value="0">{{ $t('common.income') }}</option>
                        <option :value="1">{{ $t('common.expense') }}</option>
                        <option :value="2">{{ $t('common.saving') }}</option>
                    </select>
                </div>
                <div v-if="activeTab === 'categorized'" class="col-12 col-sm-6 col-md-4">
                    <label class="filter-label">{{ $t('reports.filters.label') }}</label>
                    <VSelect
                        v-model="labelId"
                        :options="labels"
                        label="name"
                        :reduce="l => l.id"
                        :placeholder="$t('common.all')"
                        :clearable="true"
                    >
                        <template #option="l">
                            <span class="label-dot me-1" :style="{ background: l.colorCode }"></span>{{ l.name }}
                        </template>
                        <template #selected-option="l">
                            <span class="label-dot me-1" :style="{ background: l.colorCode }"></span>{{ l.name }}
                        </template>
                    </VSelect>
                </div>
            </div>
        </div>

        <!-- Tabs -->
        <div class="card-body pt-2 report-card-body">
            <ul class="nav nav-pills detail-pills mb-3">
                <li class="nav-item">
                    <button class="nav-link" :class="{ active: activeTab === 'categorized' }" @click="activeTab = 'categorized'">
                        <i class="fa fa-tags me-1"></i>{{ $t('reports.detailed.categorizedTab') }}
                    </button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" :class="{ active: activeTab === 'noncategorized' }" @click="activeTab = 'noncategorized'">
                        <i class="fa fa-list me-1"></i>{{ $t('reports.detailed.nonCategorizedTab') }}
                    </button>
                </li>
            </ul>

            <!-- Loading -->
            <div v-if="loading" class="report-loading">
                <div class="spinner-border text-success"></div>
            </div>

            <template v-else>
                <!-- ── TABLE MODE ─────────────────────────────── -->
                <template v-if="viewMode === 'table'">
                    <div v-if="activeTab === 'categorized'">
                        <div v-if="categorizedItems.length > 0" class="table-responsive">
                            <table class="report-table">
                                <thead>
                                    <tr>
                                        <th>{{ $t('reports.detailed.table.term') }}</th>
                                        <th>{{ $t('reports.detailed.table.label') }}</th>
                                        <th>{{ $t('reports.detailed.table.type') }}</th>
                                        <th class="text-end">{{ $t('reports.detailed.table.amount') }}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(item, i) in categorizedItems" :key="i">
                                        <td class="td-term">{{ formatTerm(item.term) }}</td>
                                        <td>
                                            <span v-if="item.userLabel" class="label-badge" :style="{ background: item.userLabel.colorCode + '22', color: item.userLabel.colorCode, borderColor: item.userLabel.colorCode }">
                                                <span class="label-dot" :style="{ background: item.userLabel.colorCode }"></span>
                                                {{ item.userLabel.name }}
                                            </span>
                                            <span v-else class="text-muted small">{{ $t('transactionList.noLabel') }}</span>
                                        </td>
                                        <td>
                                            <span v-if="item.transactionType === 0" class="badge badge-success">{{ $t('common.income') }}</span>
                                            <span v-else-if="item.transactionType === 2" class="badge badge-primary">{{ $t('common.saving') }}</span>
                                            <span v-else class="badge badge-danger">{{ $t('common.expense') }}</span>
                                        </td>
                                        <td class="text-end td-amount">{{ formatCurrency(item.amount, item.currency?.code) }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div v-else class="report-empty">
                            <i class="fa fa-inbox"></i>
                            <p>{{ $t('reports.detailed.noData') }}</p>
                        </div>
                    </div>

                    <div v-else-if="activeTab === 'noncategorized'">
                        <div v-if="nonCategorizedItems.length > 0" class="table-responsive">
                            <table class="report-table">
                                <thead>
                                    <tr>
                                        <th>{{ $t('reports.detailed.table.term') }}</th>
                                        <th>{{ $t('reports.detailed.table.type') }}</th>
                                        <th>{{ $t('reports.detailed.table.currency') }}</th>
                                        <th class="text-end">{{ $t('reports.detailed.table.amount') }}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(item, i) in nonCategorizedItems" :key="i">
                                        <td class="td-term">{{ formatTerm(item.term) }}</td>
                                        <td>
                                            <span v-if="item.transactionTypes === 0" class="badge badge-success">{{ $t('common.income') }}</span>
                                            <span v-else-if="item.transactionTypes === 2" class="badge badge-primary">{{ $t('common.saving') }}</span>
                                            <span v-else class="badge badge-danger">{{ $t('common.expense') }}</span>
                                        </td>
                                        <td>
                                            <span class="badge badge-primary">{{ item.currency?.code }} — {{ item.currency?.name }}</span>
                                        </td>
                                        <td class="text-end td-amount">{{ formatCurrency(item.amount, item.currency?.code) }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div v-else class="report-empty">
                            <i class="fa fa-inbox"></i>
                            <p>{{ $t('reports.detailed.noData') }}</p>
                        </div>
                    </div>
                </template>

                <!-- ── CHART MODE ─────────────────────────────── -->
                <template v-else>
                    <div v-if="currentItems.length === 0" class="report-empty">
                        <i class="fa fa-inbox"></i>
                        <p>{{ $t('reports.detailed.noData') }}</p>
                    </div>
                    <div v-else class="chart-wrap">
                        <canvas ref="chartCanvas"></canvas>
                    </div>
                </template>
            </template>
        </div>
    </div>
</template>

<script>
import { Chart } from 'chart.js/auto';
import reportService from '@/services/report.service';
import moment from 'moment';
import { useDateLocale } from '@/composables/useDateLocale';
import { getDefaultDateRange } from '@/composables/dateRangePresets';
import DateRangePresetPicker from '@/components/common/DateRangePresetPicker.vue';

const PALETTE = [
    '#10b981','#3b82f6','#f59e0b','#ef4444','#8b5cf6',
    '#06b6d4','#f97316','#84cc16','#ec4899','#14b8a6',
    '#0ea5e9','#a78bfa','#fb923c','#4ade80','#f472b6',
];

const SMALL_THRESHOLD = 3; // percent

export default {
    components: {
        'date-range-preset-picker': DateRangePresetPicker
    },
    setup() {
        const { dateLocale } = useDateLocale();
        return { dateLocale };
    },
    data() {
        return {
            activeTab: 'categorized',
            viewMode: 'table',
            chartType: 'bar',
            dateRange: getDefaultDateRange(),
            currencyId: null,
            transactionType: 1,
            labelId: null,
            categorizedItems: [],
            nonCategorizedItems: [],
            loading: false,
            debounce: null,
            chartInstance: null,
        };
    },
    computed: {
        currencies()  { return this.$store.getters['dashboard/getCurrencies']; },
        labels()      { return this.$store.getters['dashboard/getLabels']; },
        chartTypes()  {
            return [
                { key: 'bar',      icon: 'fa-bar-chart',  label: this.$t('reports.detailed.chartTypes.bar')      },
                { key: 'doughnut', icon: 'fa-pie-chart',  label: this.$t('reports.detailed.chartTypes.doughnut') },
            ];
        },
        currentItems() {
            return this.activeTab === 'categorized' ? this.categorizedItems : this.nonCategorizedItems;
        },
    },
    watch: {
        activeTab()        { this.load(); },
        dateRange()        { this.debouncedLoad(); },
        currencyId()       { this.debouncedLoad(); },
        transactionType()  { this.debouncedLoad(); },
        labelId()          { this.debouncedLoad(); },
        viewMode()         { this.$nextTick(() => this.refreshChart()); },
        chartType()        { this.$nextTick(() => this.refreshChart()); },
        categorizedItems()    { this.$nextTick(() => this.refreshChart()); },
        nonCategorizedItems() { this.$nextTick(() => this.refreshChart()); },
    },
    methods: {
        setViewMode(mode) {
            this.viewMode = mode;
        },
        debouncedLoad() {
            clearTimeout(this.debounce);
            this.debounce = setTimeout(() => this.load(), 400);
        },
        buildDateParams() {
            const [start, end] = this.dateRange || [];
            return {
                StartDate: start ? moment(start).startOf('day').toISOString() : null,
                EndDate:   end   ? moment(end).endOf('day').toISOString()     : null
            };
        },
        async load() {
            this.loading = true;
            try {
                if (this.activeTab === 'categorized') {
                    await this.loadCategorized();
                } else {
                    await this.loadNonCategorized();
                }
            } finally {
                this.loading = false;
            }
        },
        async loadCategorized() {
            const params = {
                CurrencyId:       this.currencyId ?? null,
                TransactionTypes: this.transactionType,
                NotebookLabelId:  this.labelId ?? null,
                ...this.buildDateParams()
            };
            try {
                const res = await reportService.getCategorizedTransactionReport(params);
                this.categorizedItems = res.status === 200 ? (res.data.data || []) : [];
            } catch { this.categorizedItems = []; }
        },
        async loadNonCategorized() {
            const params = {
                CurrencyId:       this.currencyId ?? null,
                TransactionTypes: this.transactionType,
                ...this.buildDateParams()
            };
            try {
                const res = await reportService.getNonCategorizedTransactionReport(params);
                this.nonCategorizedItems = res.status === 200 ? (res.data.data || []) : [];
            } catch { this.nonCategorizedItems = []; }
        },

        // ── Helpers ────────────────────────────────────────────────
        // Groups raw items into { label, color, currencyCode, total, data:{term→amount} }
        // then filters out groups whose share < SMALL_THRESHOLD%, merging into "Diğer".
        buildGroups(items, keyFn, colorFn, currencyFn) {
            const map = {};
            items.forEach((item, idx) => {
                const key = keyFn(item, idx);
                if (!map[key]) {
                    map[key] = {
                        label:        key,
                        color:        colorFn(item, Object.keys(map).length),
                        currencyCode: currencyFn(item),
                        total:        0,
                        data:         {},
                    };
                }
                const amt = item.amount || 0;
                map[key].total += amt;
                map[key].data[item.term] = (map[key].data[item.term] || 0) + amt;
            });

            const groups  = Object.values(map).sort((a, b) => b.total - a.total);
            const grand   = groups.reduce((s, g) => s + g.total, 0);
            const main    = [];
            let otherTotal = 0;
            let otherCurrency = '';
            const otherData = {};

            groups.forEach(g => {
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
                main.push({
                    label:        this.$t('common.other'),
                    color:        '#d1d5db',
                    currencyCode: otherCurrency,
                    total:        otherTotal,
                    data:         otherData,
                });
            }

            return { groups: main, grand };
        },

        makeDoughnutCenterPlugin(label, value) {
            return {
                id: 'doughnutCenter',
                afterDraw(chart) {
                    const { ctx, chartArea } = chart;
                    if (!chartArea) return;
                    const cx = (chartArea.left + chartArea.right) / 2;
                    const cy = (chartArea.top  + chartArea.bottom) / 2;
                    ctx.save();
                    ctx.textAlign    = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.font         = '600 10px Inter, sans-serif';
                    ctx.fillStyle    = '#9ca3af';
                    ctx.letterSpacing = '0.05em';
                    ctx.fillText(label.toUpperCase(), cx, cy - 11);
                    ctx.font      = 'bold 13px Inter, sans-serif';
                    ctx.fillStyle = '#111827';
                    ctx.fillText(value, cx, cy + 9);
                    ctx.restore();
                },
            };
        },

        makeChartOptions(isDoughnut, currencyCode, datasets) {
            const base = {
                responsive:          true,
                maintainAspectRatio: false,
                animation:           { duration: 350 },
                plugins: {
                    legend: {
                        position: isDoughnut ? 'right' : 'bottom',
                        labels: { font: { size: 11 }, boxWidth: 12, padding: 10 },
                    },
                    tooltip: {
                        callbacks: {
                            label: ctx => {
                                if (isDoughnut) {
                                    const pct = ctx.parsed > 0
                                        ? Math.round((ctx.parsed / ctx.dataset.data.reduce((a, b) => a + b, 0)) * 100)
                                        : 0;
                                    return ` ${ctx.label}: ${this.formatCurrency(ctx.parsed, currencyCode)} (${pct}%)`;
                                }
                                const ds = datasets[ctx.datasetIndex];
                                return ` ${ds.label}: ${this.formatCurrency(ctx.parsed.y, ds.currencyCode || currencyCode)}`;
                            },
                        },
                    },
                },
            };
            if (!isDoughnut) {
                base.scales = {
                    x: { grid: { display: false }, ticks: { font: { size: 11 } } },
                    y: {
                        ticks: { font: { size: 11 }, callback: v => this.formatCurrency(v, currencyCode) },
                        grid:  { color: '#f3f4f6' },
                    },
                };
            } else {
                base.cutout = '62%';
            }
            return base;
        },

        refreshChart() {
            if (this.viewMode !== 'chart') {
                if (this.chartInstance) { this.chartInstance.destroy(); this.chartInstance = null; }
                return;
            }
            const canvas = this.$refs.chartCanvas;
            if (!canvas) return;
            if (this.chartInstance) { this.chartInstance.destroy(); this.chartInstance = null; }

            if (this.activeTab === 'categorized') {
                this.buildCategorizedChart(canvas);
            } else {
                this.buildNonCategorizedChart(canvas);
            }
        },

        buildCategorizedChart(canvas) {
            const items = this.categorizedItems;
            if (!items.length) return;

            const { groups, grand } = this.buildGroups(
                items,
                (item, idx)  => item.userLabel?.name || this.$t('transactionList.noLabel'),
                (item, rank) => item.userLabel?.colorCode || PALETTE[rank % PALETTE.length],
                (item)       => item.currency?.code || '',
            );

            const currencyCode = items[0]?.currency?.code || '';
            const isDoughnut   = this.chartType === 'doughnut';

            let chartData, datasets;

            if (isDoughnut) {
                datasets = [{
                    data:            groups.map(g => g.total),
                    backgroundColor: groups.map(g => g.color + 'cc'),
                    borderColor:     groups.map(g => g.color),
                    borderWidth:     2,
                    hoverOffset:     6,
                }];
                chartData = { labels: groups.map(g => g.label), datasets };
            } else {
                const terms = [...new Set(items.map(i => i.term))].sort();
                const termLabels = terms.map(t => this.formatTerm(t));
                datasets = groups.map(g => ({
                    label:           g.label,
                    data:            terms.map(t => g.data[t] || 0),
                    backgroundColor: g.color + 'cc',
                    borderColor:     g.color,
                    borderWidth:     1,
                    borderRadius:    4,
                    currencyCode,
                }));
                chartData = { labels: termLabels, datasets };
            }

            this.chartInstance = new Chart(canvas, {
                type:    isDoughnut ? 'doughnut' : 'bar',
                data:    chartData,
                options: this.makeChartOptions(isDoughnut, currencyCode, datasets),
                plugins: isDoughnut
                    ? [this.makeDoughnutCenterPlugin(this.$t('common.total'), this.formatCurrency(grand, currencyCode))]
                    : [],
            });
        },

        buildNonCategorizedChart(canvas) {
            const items = this.nonCategorizedItems;
            if (!items.length) return;

            const { groups } = this.buildGroups(
                items,
                (item)       => item.currency?.code || '?',
                (item, rank) => PALETTE[rank % PALETTE.length],
                (item)       => item.currency?.code || '',
            );

            const currencyCode = groups[0]?.currencyCode || '';
            const isDoughnut   = this.chartType === 'doughnut';

            let chartData, datasets;

            if (isDoughnut) {
                datasets = [{
                    data:            groups.map(g => g.total),
                    backgroundColor: groups.map(g => g.color + 'cc'),
                    borderColor:     groups.map(g => g.color),
                    borderWidth:     2,
                    hoverOffset:     6,
                }];
                chartData = { labels: groups.map(g => g.label), datasets };
            } else {
                const terms = [...new Set(items.map(i => i.term))].sort();
                const termLabels = terms.map(t => this.formatTerm(t));
                datasets = groups.map(g => ({
                    label:           g.label,
                    data:            terms.map(t => g.data[t] || 0),
                    backgroundColor: g.color + (this.chartType === 'line' ? '33' : 'cc'),
                    borderColor:     g.color,
                    borderWidth:     this.chartType === 'line' ? 2 : 1,
                    borderRadius:    this.chartType === 'bar' ? 4 : 0,
                    fill:            this.chartType === 'line' ? false : undefined,
                    currencyCode:    g.currencyCode,
                }));
                chartData = { labels: termLabels, datasets };
            }

            const nonCatTotal = groups.reduce((s, g) => s + g.total, 0);
            this.chartInstance = new Chart(canvas, {
                type:    isDoughnut ? 'doughnut' : 'bar',
                data:    chartData,
                options: this.makeChartOptions(isDoughnut, currencyCode, datasets),
                plugins: isDoughnut
                    ? [this.makeDoughnutCenterPlugin(this.$t('common.total'), this.formatCurrency(nonCatTotal, currencyCode))]
                    : [],
            });
        },

        formatCurrency(amount, code) {
            if (amount == null) return '—';
            if (!code) return new Intl.NumberFormat(this.$i18n?.locale || 'tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
            return new Intl.NumberFormat(this.$i18n?.locale || 'tr-TR', {
                style: 'currency', currency: code,
                minimumFractionDigits: 2, maximumFractionDigits: 2
            }).format(amount);
        },
        formatTerm(term) {
            if (!term) return '—';
            return moment(term).locale(this.$i18n.locale).format('MMMM YYYY');
        },
    },
    mounted() {
        this.load();
    },
    unmounted() {
        if (this.chartInstance) { this.chartInstance.destroy(); this.chartInstance = null; }
    },
};
</script>

<style scoped>
.report-card-body {
    max-height: 420px;
    overflow-y: auto;
}

:deep(.vs__dropdown-menu) { min-width: 200px; }

/* View / chart-type toggle */
.view-toggle {
    display: flex;
    gap: 2px;
    background: #f3f4f6;
    border-radius: 8px;
    padding: 3px;
}
.view-toggle-btn {
    width: 30px;
    height: 26px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: #6b7280;
    cursor: pointer;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
}
.view-toggle-btn:hover  { background: #e5e7eb; color: #374151; }
.view-toggle-btn.active { background: #fff; color: #10b981; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }

.has-tooltip { position: relative; }
.has-tooltip::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: calc(100% + 6px);
    left: 50%;
    transform: translateX(-50%);
    background: #1f2937;
    color: #fff;
    font-size: 11px;
    font-weight: 500;
    white-space: nowrap;
    padding: 3px 8px;
    border-radius: 5px;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s;
    z-index: 10;
}
.has-tooltip:hover::after { opacity: 1; }

/* Chart type selector fade */
.fade-in-enter-active { transition: opacity 0.2s, transform 0.2s; }
.fade-in-leave-active { transition: opacity 0.15s; }
.fade-in-enter-from   { opacity: 0; transform: translateX(6px); }
.fade-in-leave-to     { opacity: 0; }

/* Filters bar */
.detail-filters {
    padding: 10px 16px;
    background: #f9fafb;
    border-bottom: 1.5px solid #e5e7eb;
}
.filter-label {
    display: block;
    font-size: 10px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 3px;
}
.detail-filters :deep(.dp__input) {
    font-size: 13px;
    height: 30px;
    min-height: unset;
    padding-top: 3px;
    padding-bottom: 3px;
}

/* Pills */
.detail-pills { gap: 4px; border-bottom: 1.5px solid #f0f0f0; padding-bottom: 8px; }
.detail-pills .nav-link {
    font-size: 13px;
    font-weight: 600;
    color: #6b7280;
    border-radius: 8px;
    padding: 5px 14px;
    border: none;
    background: transparent;
    cursor: pointer;
    transition: all 0.2s;
}
.detail-pills .nav-link:hover  { background: #f0fdf4; color: #10b981; }
.detail-pills .nav-link.active { background: #10b981; color: #fff; }

/* Loading / Empty */
.report-loading,
.report-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 16px;
    color: #9ca3af;
    gap: 6px;
}
.report-empty i { font-size: 22px; }
.report-empty p { margin: 0; font-size: 13px; }

/* Table */
.report-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
}
.report-table th {
    padding: 6px 10px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #6b7280;
    border-bottom: 2px solid #e5e7eb;
    white-space: nowrap;
}
.report-table td {
    padding: 7px 10px;
    border-bottom: 1px solid #f3f4f6;
    vertical-align: middle;
}
.report-table tr:last-child td { border-bottom: none; }
.report-table tr:hover td { background: #f9fafb; }
.td-term   { font-size: 12px; font-weight: 600; color: #6b7280; white-space: nowrap; }
.td-amount { font-weight: 700; color: #111827; white-space: nowrap; }

/* Label badge */
.label-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 2px 8px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    border: 1px solid;
}
.label-dot {
    display: inline-block;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
}

/* Chart */
.chart-wrap {
    position: relative;
    height: 320px;
    padding: 4px 0;
}
</style>
