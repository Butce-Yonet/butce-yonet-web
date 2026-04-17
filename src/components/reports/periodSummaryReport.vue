<template>
    <div class="card border">
        <div class="card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
            <h5 class="mb-0">{{ $t('reports.periodSummary.title') }}</h5>
            <div class="d-flex align-items-center gap-2 flex-wrap">
                <div class="report-datepicker">
                    <VueDatePicker
                        v-model="dateRange"
                        range
                        auto-apply
                        :placeholder="$t('reports.filters.dateRange')"
                    />
                </div>
                <div class="report-currency">
                    <VSelect
                        v-model="currencyId"
                        :options="currencies"
                        label="code"
                        :reduce="c => c.id"
                        :placeholder="$t('reports.filters.currency')"
                        :clearable="true"
                    >
                        <template #option="c">
                            <span class="fw-semibold">{{ c.code }}</span>
                            <span class="text-muted ms-1 small">{{ c.name }}</span>
                        </template>
                        <template #selected-option="c">{{ c.code }}</template>
                    </VSelect>
                </div>
            </div>
        </div>

        <div class="card-body">
            <div v-if="loading" class="report-loading">
                <div class="spinner-border text-success"></div>
            </div>

            <div v-else-if="!notebookSelected" class="report-empty">
                <i class="fa fa-book"></i>
                <p>{{ $t('reports.selectNotebook') }}</p>
            </div>

            <div v-else-if="summary" class="row g-2">
                <!-- Income -->
                <div class="col-12 col-md-4">
                    <div class="stat-card stat-income">
                        <div class="stat-icon-wrap">
                            <i class="fa fa-arrow-up"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-label">{{ $t('reports.periodSummary.income') }}</div>
                            <div class="stat-value">{{ formatCurrency(summary.totalIncome, summary.currency?.code) }}</div>
                            <div class="stat-meta">
                                <span class="stat-prev">{{ $t('reports.periodSummary.previous') }}: {{ formatCurrency(summary.previousTotalIncome, summary.currency?.code) }}</span>
                                <span v-if="summary.incomeChangePercent != null"
                                    class="stat-badge"
                                    :class="summary.incomeChangePercent >= 0 ? 'badge-up' : 'badge-down'"
                                >
                                    <i :class="summary.incomeChangePercent >= 0 ? 'fa fa-arrow-up' : 'fa fa-arrow-down'"></i>
                                    {{ Math.abs(summary.incomeChangePercent).toFixed(1) }}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Expense -->
                <div class="col-12 col-md-4">
                    <div class="stat-card stat-expense">
                        <div class="stat-icon-wrap">
                            <i class="fa fa-arrow-down"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-label">{{ $t('reports.periodSummary.expense') }}</div>
                            <div class="stat-value">{{ formatCurrency(summary.totalExpense, summary.currency?.code) }}</div>
                            <div class="stat-meta">
                                <span class="stat-prev">{{ $t('reports.periodSummary.previous') }}: {{ formatCurrency(summary.previousTotalExpense, summary.currency?.code) }}</span>
                                <span v-if="summary.expenseChangePercent != null"
                                    class="stat-badge"
                                    :class="summary.expenseChangePercent <= 0 ? 'badge-up' : 'badge-down'"
                                >
                                    <i :class="summary.expenseChangePercent <= 0 ? 'fa fa-arrow-down' : 'fa fa-arrow-up'"></i>
                                    {{ Math.abs(summary.expenseChangePercent).toFixed(1) }}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Net Balance -->
                <div class="col-12 col-md-4">
                    <div class="stat-card" :class="summary.netBalance >= 0 ? 'stat-balance-pos' : 'stat-balance-neg'">
                        <div class="stat-icon-wrap">
                            <i class="fa fa-balance-scale"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-label">{{ $t('reports.periodSummary.netBalance') }}</div>
                            <div class="stat-value">{{ formatCurrency(summary.netBalance, summary.currency?.code) }}</div>
                            <div class="stat-meta">
                                <span class="stat-prev">{{ $t('reports.periodSummary.previous') }}: {{ formatCurrency(summary.previousNetBalance, summary.currency?.code) }}</span>
                                <span v-if="summary.netBalanceChangePercent != null"
                                    class="stat-badge"
                                    :class="summary.netBalanceChangePercent >= 0 ? 'badge-up' : 'badge-down'"
                                >
                                    <i :class="summary.netBalanceChangePercent >= 0 ? 'fa fa-arrow-up' : 'fa fa-arrow-down'"></i>
                                    {{ Math.abs(summary.netBalanceChangePercent).toFixed(1) }}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Period info -->
                <div class="col-12">
                    <div class="period-info-bar">
                        <i class="fa fa-calendar me-1"></i>
                        {{ $t('reports.periodSummary.currentPeriod') }}:
                        <strong>{{ formatDate(summary.startDate) }} – {{ formatDate(summary.endDate) }}</strong>
                        <span class="mx-2 text-muted">|</span>
                        {{ $t('reports.periodSummary.previousPeriod') }}:
                        <strong>{{ formatDate(summary.previousPeriodStartDate) }} – {{ formatDate(summary.previousPeriodEndDate) }}</strong>
                    </div>
                </div>
            </div>

            <div v-else class="report-empty">
                <i class="fa fa-chart-bar"></i>
                <p>{{ $t('reports.periodSummary.noData') }}</p>
            </div>
        </div>
    </div>
</template>

<script>
import reportService from '@/services/report.service';
import moment from 'moment';

export default {
    data() {
        return {
            dateRange: [
                moment().startOf('month').toDate(),
                moment().endOf('month').toDate()
            ],
            currencyId: null,
            summary: null,
            loading: false,
            debounce: null
        };
    },
    computed: {
        currencies() {
            return this.$store.getters['dashboard/getCurrencies'];
        },
        notebookSelected() {
            return this.$store.state.notebook.selectedNotebook?.id > 0;
        },
        notebookId() {
            return this.$store.state.notebook.selectedNotebook?.id;
        }
    },
    watch: {
        notebookId(val) {
            if (val > 0) this.load();
        },
        dateRange() { this.debouncedLoad(); },
        currencyId() { this.debouncedLoad(); }
    },
    methods: {
        debouncedLoad() {
            clearTimeout(this.debounce);
            this.debounce = setTimeout(() => this.load(), 400);
        },
        async load() {
            if (!this.notebookSelected) return;
            this.loading = true;
            try {
                const [start, end] = this.dateRange || [];
                const params = {
                    NotebookId: this.notebookId,
                    CurrencyId: this.currencyId ?? null,
                    StartDate: start ? moment(start).startOf('day').toISOString() : null,
                    EndDate: end ? moment(end).endOf('day').toISOString() : null
                };
                const res = await reportService.getPeriodSummary(params);
                this.summary = res.status === 200 ? res.data.data : null;
            } catch {
                this.summary = null;
            } finally {
                this.loading = false;
            }
        },
        formatCurrency(amount, code) {
            if (amount == null) return '—';
            const locale = this.$i18n?.locale || 'tr-TR';
            if (!code) {
                return new Intl.NumberFormat(locale, {
                    minimumFractionDigits: 2, maximumFractionDigits: 2
                }).format(amount);
            }
            return new Intl.NumberFormat(locale, {
                style: 'currency', currency: code,
                minimumFractionDigits: 2, maximumFractionDigits: 2
            }).format(amount);
        },
        formatDate(date) {
            if (!date) return '—';
            return moment(date).format('DD.MM.YYYY');
        }
    },
    mounted() {
        if (this.notebookSelected) this.load();
    }
}
</script>

<style scoped>
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

/* Filters */
.report-datepicker { width: 220px; }
.report-datepicker :deep(.dp__input) {
    font-size: 13px;
    height: 30px;
    min-height: unset;
    padding-top: 3px;
    padding-bottom: 3px;
}
.report-currency { width: 140px; }
:deep(.vs__dropdown-menu) { min-width: 200px; }

/* Stat cards */
.stat-card {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 14px;
    border-radius: 12px;
    height: 100%;
}

.stat-income    { background: linear-gradient(135deg, #f0fdf4, #dcfce7); border: 1.5px solid #6ee7b7; }
.stat-expense   { background: linear-gradient(135deg, #fff1f2, #ffe4e6); border: 1.5px solid #fca5a5; }
.stat-balance-pos { background: linear-gradient(135deg, #eff6ff, #dbeafe); border: 1.5px solid #93c5fd; }
.stat-balance-neg { background: linear-gradient(135deg, #fff7ed, #ffedd5); border: 1.5px solid #fdba74; }

.stat-icon-wrap {
    width: 34px;
    height: 34px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    flex-shrink: 0;
}
.stat-income .stat-icon-wrap    { background: #10b981; color: #fff; }
.stat-expense .stat-icon-wrap   { background: #ef4444; color: #fff; }
.stat-balance-pos .stat-icon-wrap { background: #3b82f6; color: #fff; }
.stat-balance-neg .stat-icon-wrap { background: #f97316; color: #fff; }

.stat-content { flex: 1; min-width: 0; }

.stat-label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #6b7280;
    margin-bottom: 2px;
}

.stat-value {
    font-size: 18px;
    font-weight: 700;
    color: #111827;
    line-height: 1.2;
    margin-bottom: 4px;
}

.stat-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
}

.stat-prev {
    font-size: 11px;
    color: #6b7280;
}

.stat-badge {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 1px 6px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
}
.badge-up   { background: #dcfce7; color: #15803d; }
.badge-down { background: #fee2e2; color: #dc2626; }

/* Period info bar */
.period-info-bar {
    padding: 6px 12px;
    background: #f9fafb;
    border-radius: 8px;
    font-size: 11px;
    color: #6b7280;
    border: 1px solid #e5e7eb;
}
.period-info-bar strong { color: #374151; }

@media (max-width: 576px) {
    .report-datepicker { width: 100%; }
    .report-currency { width: 100%; }
    .stat-value { font-size: 18px; }
}
</style>
