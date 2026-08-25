<template>
    <div class="modal fade" id="dayDetailModal" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div class="modal-content border-0 shadow-lg">

                <div class="modal-header border-0 pb-0 px-4 pt-4">
                    <h5 class="modal-title mb-0 fw-semibold">{{ formattedDate }}</h5>
                    <button class="btn-close" type="button" aria-label="Close" @click="close"></button>
                </div>

                <div class="modal-body px-4 pt-3 pb-4">
                    <div v-if="transactions.length === 0" class="day-modal-state">
                        <i class="fa fa-inbox text-muted" style="font-size:22px"></i>
                        <span class="text-muted small">{{ $t('calendarPage.noTransactions') }}</span>
                    </div>
                    <ul v-else class="day-tx-list">
                        <li v-for="tx in transactions" :key="tx.id" class="day-tx-item">
                            <div class="tx-icon" :class="txIconClass(tx)">
                                <i :class="txIconGlyph(tx)"></i>
                            </div>
                            <div class="tx-body">
                                <div class="tx-name">{{ tx.name }}</div>
                                <div class="tx-desc" v-if="tx.description">{{ tx.description }}</div>
                                <div class="tx-labels" v-if="tx.labels && tx.labels.length > 0">
                                    <span
                                        v-for="label in tx.labels"
                                        :key="label.id"
                                        class="badge"
                                        :style="{ backgroundColor: label.colorCode }"
                                    >{{ label.name }}</span>
                                </div>
                            </div>
                            <div class="tx-amount" :class="amountClass(tx)">
                                {{ amountSign(tx) }}{{ formatCurrency(tx.amount, tx.currency?.code) }}
                            </div>
                        </li>
                    </ul>
                </div>

            </div>
        </div>
    </div>
</template>

<script>
import moment from 'moment';

export default {
    props: {
        modal: {
            type: Object,
            required: true
        },
        date: {
            type: Date,
            required: false,
            default: null
        },
        transactions: {
            type: Array,
            required: false,
            default: () => []
        }
    },
    computed: {
        formattedDate() {
            if (!this.date) return '';
            return moment(this.date).locale(this.$i18n.locale).format('D MMMM YYYY, dddd');
        }
    },
    methods: {
        close() {
            this.modal.hide();
        },
        formatCurrency(amount, currencyCode) {
            if (amount == null || !currencyCode) return '';
            return new Intl.NumberFormat('tr-TR', {
                style: 'currency',
                currency: currencyCode,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(amount);
        },
        txIconClass(tx) {
            if (tx.transactionType === 0) return 'tx-income';
            if (tx.transactionType === 2) return 'tx-saving';
            return 'tx-expense';
        },
        txIconGlyph(tx) {
            if (tx.transactionType === 0) return 'fa fa-arrow-up';
            if (tx.transactionType === 2) return 'fa fa-bullseye';
            return 'fa fa-arrow-down';
        },
        amountClass(tx) {
            if (tx.transactionType === 0) return 'amount-positive';
            if (tx.transactionType === 2) return 'amount-saving';
            return 'amount-negative';
        },
        amountSign(tx) {
            if (tx.transactionType === 1) return '-';
            return '+';
        },
    }
}
</script>

<style scoped>
.modal-content {
    border-radius: 16px;
}

.day-modal-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 40px 0;
}

.day-tx-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-height: 55vh;
    overflow-y: auto;
}

.day-tx-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 10px 4px;
    border-bottom: 1px solid #f1f3f5;
}

.day-tx-item:last-child {
    border-bottom: none;
}

.tx-icon {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 13px;
    flex-shrink: 0;
}

.tx-income { background: linear-gradient(135deg, #10b981, #059669); }
.tx-expense { background: linear-gradient(135deg, #ef4444, #dc2626); }
.tx-saving { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }

.tx-body {
    flex: 1;
    min-width: 0;
}

.tx-name {
    font-weight: 600;
    font-size: 14px;
    color: #111827;
}

.tx-desc {
    font-size: 12.5px;
    color: #6b7280;
    margin-top: 1px;
}

.tx-labels {
    margin-top: 4px;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

.tx-labels .badge {
    font-size: 10.5px;
    color: #fff;
}

.tx-amount {
    font-weight: 700;
    white-space: nowrap;
    font-size: 14px;
}

.amount-positive { color: #10b981; }
.amount-negative { color: #ef4444; }
.amount-saving { color: #3b82f6; }
</style>
