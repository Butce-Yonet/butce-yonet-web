<template>
    <div class="card border h-100">
        <div class="card-header">
            <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
                <h5 class="mb-0">{{ $t('reports.categorySpending.title') }}</h5>
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
            <div class="d-flex align-items-center gap-2 flex-wrap">
                <date-range-preset-picker v-model="dateRange" />
                <div class="report-datepicker">
                    <VueDatePicker
                        v-model="dateRange"
                        range
                        auto-apply
                        :placeholder="$t('reports.filters.dateRange')"
                        :locale="dateLocale"
                    />
                </div>
            </div>
        </div>

        <div class="card-body report-card-body">
            <div v-if="loading" class="report-loading">
                <div class="spinner-border text-success"></div>
            </div>

            <div v-else-if="report && report.items && report.items.length > 0">
                <!-- Total -->
                <div class="spending-total mb-3">
                    <span class="spending-total-label">{{ $t('reports.categorySpending.total') }}</span>
                    <span class="spending-total-value">{{ formatCurrency(report.generalTotalAmount) }}</span>
                </div>

                <!-- Category list -->
                <div class="spending-list">
                    <div
                        v-for="(item, index) in sortedItems"
                        :key="index"
                        class="spending-item"
                    >
                        <div class="spending-item-header">
                            <div class="spending-cat-name">
                                <span class="cat-dot" :style="{ background: itemColor(item, index) }"></span>
                                {{ item.categoryName || $t('transactionList.noLabel') }}
                            </div>
                            <div class="spending-item-right">
                                <span class="spending-amount">{{ formatCurrency(item.amount) }}</span>
                                <span class="spending-pct-badge" :style="{ background: itemColor(item, index) + '22', color: itemColor(item, index) }">
                                    {{ item.percentage.toFixed(1) }}%
                                </span>
                            </div>
                        </div>

                        <div class="spending-bar-wrap">
                            <div
                                class="spending-bar"
                                :style="{ width: item.percentage + '%', background: itemColor(item, index) }"
                            ></div>
                        </div>

                        <div v-if="item.previousAmount != null" class="spending-prev">
                            {{ $t('reports.categorySpending.previousPeriod') }}: {{ formatCurrency(item.previousAmount) }}
                            <span v-if="item.previousAmount > 0" class="spending-diff" :class="item.amount <= item.previousAmount ? 'diff-good' : 'diff-bad'">
                                <i :class="item.amount <= item.previousAmount ? 'fa fa-arrow-down' : 'fa fa-arrow-up'"></i>
                                {{ Math.abs(((item.amount - item.previousAmount) / item.previousAmount) * 100).toFixed(1) }}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else class="report-empty">
                <i class="fa fa-tags"></i>
                <p>{{ $t('reports.categorySpending.noData') }}</p>
            </div>
        </div>
    </div>
</template>

<script>
import reportService from '@/services/report.service';
import moment from 'moment';
import { useDateLocale } from '@/composables/useDateLocale';
import { getDefaultDateRange } from '@/composables/dateRangePresets';
import DateRangePresetPicker from '@/components/common/DateRangePresetPicker.vue';

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
            dateRange: getDefaultDateRange(),
            currencyId: null,
            report: null,
            loading: false,
            debounce: null,
            palette: [
                '#10b981', '#3b82f6', '#f59e0b', '#ef4444',
                '#8b5cf6', '#06b6d4', '#f97316', '#ec4899',
                '#84cc16', '#6366f1'
            ]
        };
    },
    computed: {
        currencies() {
            return this.$store.getters['dashboard/getCurrencies'];
        },
        sortedItems() {
            if (!this.report?.items) return [];
            return [...this.report.items].sort((a, b) => b.amount - a.amount);
        }
    },
    watch: {
        dateRange() { this.debouncedLoad(); },
        currencyId() { this.debouncedLoad(); }
    },
    methods: {
        debouncedLoad() {
            clearTimeout(this.debounce);
            this.debounce = setTimeout(() => this.load(), 400);
        },
        async load() {
            this.loading = true;
            try {
                const [start, end] = this.dateRange || [];
                const params = {
                    CurrencyId: this.currencyId ?? null,
                    StartDate: start ? moment(start).startOf('day').toISOString() : null,
                    EndDate: end ? moment(end).endOf('day').toISOString() : null
                };
                const res = await reportService.getCategorySpending(params);
                this.report = res.status === 200 ? res.data.data : null;
            } catch {
                this.report = null;
            } finally {
                this.loading = false;
            }
        },
        itemColor(_item, index) {
            return this.palette[index % this.palette.length];
        },
        formatCurrency(amount) {
            if (amount == null) return '—';
            const code = this.report?.currency?.code || null;
            if (!code) return new Intl.NumberFormat(this.$i18n?.locale || 'tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
            return new Intl.NumberFormat(this.$i18n?.locale || 'tr-TR', {
                style: 'currency', currency: code,
                minimumFractionDigits: 2, maximumFractionDigits: 2
            }).format(amount);
        }
    },
    mounted() {
        this.load();
    }
}
</script>

<style scoped>
.report-card-body {
    max-height: 400px;
    overflow-y: auto;
}

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

.report-datepicker { width: 200px; }
.report-datepicker :deep(.dp__input) {
    font-size: 13px;
    height: 30px;
    min-height: unset;
    padding-top: 3px;
    padding-bottom: 3px;
}
.report-currency { width: 130px; }
:deep(.vs__dropdown-menu) { min-width: 200px; }

/* Total row */
.spending-total {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 7px 12px;
    background: #f0fdf4;
    border-radius: 8px;
    border: 1px solid #6ee7b7;
}
.spending-total-label { font-size: 11px; font-weight: 600; color: #059669; text-transform: uppercase; letter-spacing: 0.04em; }
.spending-total-value { font-size: 14px; font-weight: 700; color: #065f46; }

/* List */
.spending-list { display: flex; flex-direction: column; gap: 8px; }

.spending-item { background: #fafafa; border: 1px solid #f0f0f0; border-radius: 8px; padding: 8px 12px; }

.spending-item-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px; }

.spending-cat-name {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 13px;
    font-weight: 600;
    color: #1f2937;
}

.cat-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
}

.spending-item-right { display: flex; align-items: center; gap: 8px; }

.spending-amount { font-size: 13px; font-weight: 700; color: #374151; }

.spending-pct-badge {
    padding: 2px 8px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
}

/* Progress bar */
.spending-bar-wrap {
    height: 6px;
    background: #e5e7eb;
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 6px;
}
.spending-bar {
    height: 100%;
    border-radius: 10px;
    transition: width 0.4s ease;
    min-width: 2px;
}

/* Previous period */
.spending-prev {
    font-size: 11px;
    color: #9ca3af;
    display: flex;
    align-items: center;
    gap: 6px;
}
.spending-diff {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    font-weight: 600;
    font-size: 11px;
}
.diff-good { color: #10b981; }
.diff-bad  { color: #ef4444; }

@media (max-width: 576px) {
    .report-datepicker { width: 100%; }
    .report-currency { width: 100%; }
}
</style>
