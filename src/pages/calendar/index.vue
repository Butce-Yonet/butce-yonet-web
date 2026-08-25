<template>
    <div class="container-fluid pt-4">
        <div class="card border-0 cal-card">
            <div class="cal-header">
                <div class="cal-header-title">
                    <div class="cal-header-icon">
                        <i class="fa fa-calendar"></i>
                    </div>
                    <div>
                        <span class="cal-eyebrow">{{ $t('calendarPage.title') }}</span>
                        <h5 class="cal-month text-capitalize">{{ monthTitle }}</h5>
                    </div>
                </div>
                <div class="cal-header-actions">
                    <button class="cal-today-btn" @click="goToday">
                        {{ $t('calendarPage.today') }}
                    </button>
                    <div class="cal-nav">
                        <button class="cal-nav-btn" @click="prevMonth">
                            <i class="fa fa-chevron-left"></i>
                        </button>
                        <button class="cal-nav-btn" @click="nextMonth">
                            <i class="fa fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            </div>

            <div v-if="calendarData && !loading" class="cal-summary">
                <div class="cal-summary-chip chip-income">
                    <i class="fa fa-arrow-up"></i>
                    <div>
                        <div class="chip-label">{{ $t('common.income') }}</div>
                        <div class="chip-value">{{ formatNumber(calendarData.totalIncome) }}</div>
                    </div>
                </div>
                <div class="cal-summary-chip chip-expense">
                    <i class="fa fa-arrow-down"></i>
                    <div>
                        <div class="chip-label">{{ $t('common.expense') }}</div>
                        <div class="chip-value">{{ formatNumber(calendarData.totalExpense) }}</div>
                    </div>
                </div>
                <div class="cal-summary-chip" :class="calendarData.netBalance >= 0 ? 'chip-balance-pos' : 'chip-balance-neg'">
                    <i class="fa fa-balance-scale"></i>
                    <div>
                        <div class="chip-label">{{ $t('reports.periodSummary.netBalance') }}</div>
                        <div class="chip-value">{{ formatNumber(calendarData.netBalance) }}</div>
                    </div>
                </div>
            </div>

            <div class="card-body p-0">
                <div v-if="loading" class="cal-state">
                    <div class="spinner-border text-success"></div>
                </div>

                <template v-else>
                    <div class="cal-weekday-row">
                        <div
                            v-for="wd in weekdayLabels"
                            :key="wd.text"
                            class="cal-weekday"
                            :class="{ 'is-weekend': wd.isWeekend }"
                        >{{ wd.text }}</div>
                    </div>

                    <div class="cal-grid">
                        <div
                            v-for="cell in flattenedDays"
                            :key="cell.iso"
                            class="cal-cell"
                            :class="{ 'is-out': !cell.inMonth, 'is-today': cell.isToday, 'is-weekend': cell.isWeekend }"
                            @click="openDay(cell)"
                        >
                            <div class="cal-cell-header">
                                <span class="cal-cell-date">{{ cell.date.date() }}</span>
                                <span v-if="cell.dayData?.transactionCount" class="cal-cell-count">{{ cell.dayData.transactionCount }}</span>
                            </div>

                            <div v-if="cell.dayData && cell.dayData.transactionCount > 0" class="cal-cell-body">
                                <div
                                    v-for="tx in cell.dayData.previewTransactions"
                                    :key="tx.id"
                                    class="cal-preview-item"
                                    :class="previewClass(tx)"
                                >
                                    <span class="cal-preview-name">{{ tx.name }}</span>
                                    <span class="cal-preview-amount">
                                        {{ previewSign(tx) }}{{ formatCurrency(tx.amount, tx.currency?.code) }}
                                    </span>
                                </div>
                                <div
                                    v-if="cell.dayData.transactionCount > (cell.dayData.previewTransactions?.length || 0)"
                                    class="cal-preview-more"
                                >
                                    {{ $t('calendarPage.more', { count: cell.dayData.transactionCount - (cell.dayData.previewTransactions?.length || 0) }) }}
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </div>
        </div>

        <Teleport to="body">
            <div v-if="dayLoading" class="cal-day-loading-overlay">
                <div class="spinner-border text-success"></div>
            </div>
            <day-detail-modal :modal="dayModal" :date="selectedDate" :transactions="dayTransactions"></day-detail-modal>
        </Teleport>
    </div>
</template>

<script>
import transactionService from '@/services/transaction.service';
import dayDetailModal from '@/components/calendar/dayDetailModal.vue';
import * as bootstrap from 'bootstrap';
import moment from 'moment';

export default {
    components: {
        'day-detail-modal': dayDetailModal,
    },
    data() {
        return {
            currentDate: moment().startOf('month'),
            calendarData: null,
            loading: false,
            previewCount: 3,
            dayModal: {},
            selectedDate: null,
            dayTransactions: [],
            dayLoading: false,
        };
    },
    computed: {
        monthTitle() {
            return this.currentDate.clone().locale(this.$i18n.locale).format('MMMM YYYY');
        },
        weekdayLabels() {
            const start = moment().locale(this.$i18n.locale).startOf('isoWeek');
            const labels = [];
            for (let i = 0; i < 7; i++) {
                const day = start.clone().add(i, 'days');
                labels.push({ text: day.format('ddd'), isWeekend: day.isoWeekday() >= 6 });
            }
            return labels;
        },
        dayMap() {
            const map = {};
            (this.calendarData?.days || []).forEach(d => {
                map[moment(d.date).format('YYYY-MM-DD')] = d;
            });
            return map;
        },
        flattenedDays() {
            const gridStart = this.currentDate.clone().startOf('month').startOf('isoWeek');
            const gridEnd = this.currentDate.clone().endOf('month').endOf('isoWeek');
            const today = moment();
            const cells = [];
            const cursor = gridStart.clone();
            while (cursor.isSameOrBefore(gridEnd, 'day')) {
                const iso = cursor.format('YYYY-MM-DD');
                cells.push({
                    date: cursor.clone(),
                    iso,
                    inMonth: cursor.month() === this.currentDate.month(),
                    isToday: cursor.isSame(today, 'day'),
                    isWeekend: cursor.isoWeekday() >= 6,
                    dayData: this.dayMap[iso] || null,
                });
                cursor.add(1, 'day');
            }
            return cells;
        },
    },
    methods: {
        async loadCalendar() {
            this.loading = true;
            try {
                const response = await transactionService.getCalendar({
                    Year: this.currentDate.year(),
                    Month: this.currentDate.month() + 1,
                    PreviewCount: this.previewCount,
                });

                if (response.status !== 200) {
                    this.$swal('Error', this.$t('calendarPage.messages.calendarLoadError'), 'error');
                    return;
                }

                this.calendarData = response.data.data;
            } catch (e) {
                this.$swal('Error', this.$t('calendarPage.messages.calendarLoadError'), 'error');
            } finally {
                this.loading = false;
            }
        },
        prevMonth() {
            this.currentDate = this.currentDate.clone().subtract(1, 'month');
            this.loadCalendar();
        },
        nextMonth() {
            this.currentDate = this.currentDate.clone().add(1, 'month');
            this.loadCalendar();
        },
        goToday() {
            this.currentDate = moment().startOf('month');
            this.loadCalendar();
        },
        async openDay(cell) {
            if (this.dayLoading) return;

            this.selectedDate = cell.date.toDate();
            this.dayLoading = true;
            try {
                const response = await transactionService.getAllTransactions({
                    PageNumber: 1,
                    PageSize: 100,
                    SortColumn: '',
                    SortDirection: 'Ascending',
                    StartTime: moment(this.selectedDate).startOf('day').toISOString(),
                    EndTime: moment(this.selectedDate).endOf('day').toISOString(),
                });

                if (response.status !== 200) {
                    this.$swal('Error', this.$t('calendarPage.messages.dayTransactionsLoadError'), 'error');
                    return;
                }

                this.dayTransactions = response.data.data.items;
                this.dayModal.show();
            } catch (e) {
                this.$swal('Error', this.$t('calendarPage.messages.dayTransactionsLoadError'), 'error');
            } finally {
                this.dayLoading = false;
            }
        },
        formatCurrency(amount, currencyCode) {
            if (amount == null || !currencyCode) return '';
            return new Intl.NumberFormat('tr-TR', {
                style: 'currency',
                currency: currencyCode,
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }).format(amount);
        },
        previewClass(tx) {
            if (tx.transactionType === 0) return 'preview-income';
            if (tx.transactionType === 2) return 'preview-saving';
            return 'preview-expense';
        },
        previewSign(tx) {
            if (tx.transactionType === 1) return '-';
            return '+';
        },
        formatNumber(value) {
            if (value == null) return '';
            return new Intl.NumberFormat('tr-TR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(value);
        },
    },
    mounted() {
        const modalElement = document.getElementById('dayDetailModal');
        if (modalElement) {
            this.dayModal = new bootstrap.Modal(modalElement, {
                backdrop: true,
                keyboard: true
            });
        }
        this.loadCalendar();
    },
    beforeUnmount() {
        if (this.dayModal?.hide) {
            this.dayModal.hide();
            this.dayModal.dispose();
        }
    },
};
</script>

<style scoped>
.cal-card {
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(16, 24, 40, 0.06), 0 1px 2px rgba(16, 24, 40, 0.04);
}

/* ── Header ──────────────────────────────────────────────────────── */
.cal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    padding: 20px 24px;
    border-bottom: 1px solid #f1f3f5;
}

.cal-header-title {
    display: flex;
    align-items: center;
    gap: 14px;
}

.cal-header-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: linear-gradient(135deg, #10b981, #059669);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
    box-shadow: 0 4px 10px rgba(16, 185, 129, 0.28);
}

.cal-eyebrow {
    display: block;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #9ca3af;
    margin-bottom: 2px;
}

.cal-month {
    margin: 0;
    font-size: 19px;
    font-weight: 700;
    color: #111827;
}

.cal-header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
}

.cal-today-btn {
    border: 1.5px solid #e5e7eb;
    background: #fff;
    color: #374151;
    font-size: 13px;
    font-weight: 600;
    padding: 7px 16px;
    border-radius: 9px;
    cursor: pointer;
    transition: all 0.15s;
}

.cal-today-btn:hover {
    border-color: #10b981;
    color: #059669;
    background: #ecfdf5;
}

.cal-nav {
    display: inline-flex;
    gap: 4px;
    background: #f3f4f6;
    padding: 3px;
    border-radius: 10px;
}

.cal-nav-btn {
    width: 30px;
    height: 30px;
    border: none;
    background: transparent;
    border-radius: 7px;
    color: #6b7280;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s;
    font-size: 12px;
}

.cal-nav-btn:hover {
    background: #fff;
    color: #111827;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

/* ── Summary chips ───────────────────────────────────────────────── */
.cal-summary {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding: 14px 24px;
    background: #f9fafb;
    border-bottom: 1.5px solid #e5e7eb;
}

.cal-summary-chip {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #fff;
    border: 1px solid #eef0f2;
    border-radius: 12px;
    padding: 8px 14px;
    flex: 1 1 170px;
}

.cal-summary-chip i {
    width: 30px;
    height: 30px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    flex-shrink: 0;
}

.chip-income i { background: #ecfdf5; color: #059669; }
.chip-expense i { background: #fef2f2; color: #dc2626; }
.chip-balance-pos i { background: #ecfdf5; color: #059669; }
.chip-balance-neg i { background: #fef2f2; color: #dc2626; }

.chip-label {
    font-size: 10.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #9ca3af;
}

.chip-value {
    font-size: 14px;
    font-weight: 700;
    color: #111827;
}

.chip-balance-pos .chip-value { color: #059669; }
.chip-balance-neg .chip-value { color: #dc2626; }

/* ── Grid ────────────────────────────────────────────────────────── */
.cal-state {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60px 0;
}

.cal-weekday-row {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    background: #fff;
    border-bottom: 1px solid #f1f3f5;
}

.cal-weekday {
    text-align: center;
    padding: 12px 4px 10px;
    font-size: 11px;
    font-weight: 700;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.cal-weekday.is-weekend {
    color: #d97706;
}

.cal-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
}

.cal-cell {
    min-height: 118px;
    border-right: 1px solid #f1f3f5;
    border-bottom: 1px solid #f1f3f5;
    padding: 8px;
    cursor: pointer;
    transition: background 0.15s, box-shadow 0.15s;
    display: flex;
    flex-direction: column;
    gap: 4px;
    position: relative;
}

.cal-grid .cal-cell:nth-child(7n) {
    border-right: none;
}

.cal-cell:hover {
    background: #f0fdf9;
    box-shadow: inset 0 0 0 1.5px #a7f3d0;
    z-index: 1;
}

.cal-cell.is-weekend:not(.is-out) {
    background: #fdfbf6;
}

.cal-cell.is-out {
    background: #fcfcfd;
}

.cal-cell.is-out:hover {
    background: #f6f7f8;
    box-shadow: none;
}

.cal-cell.is-out .cal-cell-date {
    color: #d1d5db;
}

.cal-cell.is-today {
    background: #ecfdf5;
}

.cal-cell.is-today:hover {
    background: #ecfdf5;
    box-shadow: inset 0 0 0 1.5px #6ee7b7;
}

.cal-cell-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.cal-cell-date {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    font-size: 12.5px;
    font-weight: 700;
    color: #374151;
}

.cal-cell.is-today .cal-cell-date {
    background: #10b981;
    color: #fff;
    box-shadow: 0 2px 6px rgba(16, 185, 129, 0.35);
}

.cal-cell-count {
    font-size: 9.5px;
    font-weight: 700;
    color: #9ca3af;
    background: #f3f4f6;
    border-radius: 20px;
    padding: 1px 6px;
}

.cal-cell-body {
    display: flex;
    flex-direction: column;
    gap: 3px;
    overflow: hidden;
}

.cal-preview-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 4px;
    padding: 3px 6px;
    border-radius: 6px;
    font-size: 10.5px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    border-left: 2.5px solid transparent;
}

.cal-preview-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.cal-preview-amount {
    flex-shrink: 0;
}

.preview-income {
    background: #ecfdf5;
    color: #059669;
    border-left-color: #10b981;
}

.preview-saving {
    background: #eff6ff;
    color: #2563eb;
    border-left-color: #3b82f6;
}

.preview-expense {
    background: #fef2f2;
    color: #dc2626;
    border-left-color: #ef4444;
}

.cal-preview-more {
    font-size: 10px;
    font-weight: 700;
    color: #6b7280;
    padding: 2px 6px;
    background: #f3f4f6;
    border-radius: 6px;
    text-align: center;
}

.cal-day-loading-overlay {
    position: fixed;
    inset: 0;
    background: rgba(255, 255, 255, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1200;
}

@media (max-width: 768px) {
    .cal-header {
        padding: 16px 18px;
    }
    .cal-summary {
        padding: 12px 18px;
    }
    .cal-cell {
        min-height: 74px;
        padding: 5px;
    }
    .cal-preview-item {
        font-size: 9.5px;
    }
    .cal-cell-count {
        display: none;
    }
}
</style>
