<template>
    <div class="card border h-100">
        <div class="card-header">
            <h5 class="mb-0">{{ $t('reports.detailed.title') }}</h5>
        </div>

        <!-- Shared filters -->
        <div class="detail-filters">
            <div class="row g-2">
                <div class="col-12 col-sm-6 col-md-4">
                    <label class="filter-label">{{ $t('reports.filters.dateRange') }}</label>
                    <VueDatePicker v-model="dateRange" range auto-apply :placeholder="$t('reports.filters.dateRange')" />
                </div>
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
                    </select>
                </div>
                <!-- Label filter - only for categorized tab -->
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

            <div v-else-if="!notebookSelected" class="report-empty">
                <i class="fa fa-book"></i>
                <p>{{ $t('reports.selectNotebook') }}</p>
            </div>

            <!-- Categorized table -->
            <div v-else-if="activeTab === 'categorized'">
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
                                    <span v-if="item.notebookLabel" class="label-badge" :style="{ background: item.notebookLabel.colorCode + '22', color: item.notebookLabel.colorCode, borderColor: item.notebookLabel.colorCode }">
                                        <span class="label-dot" :style="{ background: item.notebookLabel.colorCode }"></span>
                                        {{ item.notebookLabel.name }}
                                    </span>
                                    <span v-else class="text-muted small">{{ $t('transactionList.noLabel') }}</span>
                                </td>
                                <td>
                                    <span v-if="item.transactionType === 0" class="badge badge-success">{{ $t('common.income') }}</span>
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

            <!-- NonCategorized table -->
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
        </div>
    </div>
</template>

<script>
import reportService from '@/services/report.service';
import moment from 'moment';

export default {
    data() {
        return {
            activeTab: 'categorized',
            dateRange: [
                moment().startOf('month').toDate(),
                moment().endOf('month').toDate()
            ],
            currencyId: null,
            transactionType: 1,
            labelId: null,
            categorizedItems: [],
            nonCategorizedItems: [],
            loading: false,
            debounce: null
        };
    },
    computed: {
        currencies() { return this.$store.getters['dashboard/getCurrencies']; },
        labels()     { return this.$store.getters['dashboard/getLabels']; },
        notebookSelected() { return this.$store.state.notebook.selectedNotebook?.id > 0; },
        notebookId() { return this.$store.state.notebook.selectedNotebook?.id; }
    },
    watch: {
        notebookId(val) { if (val > 0) this.load(); },
        activeTab()     { this.load(); },
        dateRange()     { this.debouncedLoad(); },
        currencyId()    { this.debouncedLoad(); },
        transactionType(){ this.debouncedLoad(); },
        labelId()       { this.debouncedLoad(); }
    },
    methods: {
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
            if (!this.notebookSelected) return;
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
                NotebookId:       this.notebookId,
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
                NotebookId:       this.notebookId,
                CurrencyId:       this.currencyId ?? null,
                TransactionTypes: this.transactionType,
                ...this.buildDateParams()
            };
            try {
                const res = await reportService.getNonCategorizedTransactionReport(params);
                this.nonCategorizedItems = res.status === 200 ? (res.data.data || []) : [];
            } catch { this.nonCategorizedItems = []; }
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
            return moment(term).format('MMM YYYY');
        }
    },
    mounted() {
        if (this.notebookSelected) this.load();
    }
}
</script>

<style scoped>
.report-card-body {
    max-height: 340px;
    overflow-y: auto;
}

:deep(.vs__dropdown-menu) { min-width: 200px; }

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
.detail-pills .nav-link:hover { background: #f0fdf4; color: #10b981; }
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

.td-term  { font-size: 12px; font-weight: 600; color: #6b7280; white-space: nowrap; }
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
</style>
