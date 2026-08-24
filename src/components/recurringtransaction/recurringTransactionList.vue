<template>
    <div class="card border">
        <div class="card-header">
            <h5 class="mb-0">{{ $t('recurringTransactionList.title') }}</h5>
        </div>

        <div class="card-body">
            <div class="col-sm-12 col-md-12 m-t-15">
                <EasyDataTable
                    id="recurringTransactionList"
                    v-model:server-options="serverOptions"
                    :server-items-length="itemsLength"
                    :headers="headers"
                    :items="recurringTransactions"
                    :loading="loading"
                >
                    <template #empty-message>
                        <span>{{ $t('common.noDataText') }}</span>
                    </template>

                    <template #item-amount="item">
                        <span class="tx-amount" :class="item.transaction.transactionType === 0 ? 'amount-positive' : 'amount-negative'">
                            {{ item.transaction.transactionType === 0 ? '+' : '-' }}{{ formatCurrency(item.transaction.amount, item.transaction.currency.code) }}
                        </span>
                    </template>

                    <template #item-nextOccurrence="item">
                        {{ formatDate(item.nextOccurrence) }}
                    </template>

                    <template #item-labels="item">
                        <span v-for="label in item.transaction.labels" class="badge"
                            :style="{ backgroundColor: label.colorCode }">
                            {{ label.name }}
                        </span>

                        <span v-if="item.transaction.labels.length < 1">
                            <span class="badge badge-danger">
                                <i class="fa fa-exclamation"></i>
                                {{ $t('transactionList.noLabel') }}
                            </span>
                        </span>
                    </template>

                    <template #item-frequency="item">
                        <span class="badge badge-warning">
                            {{
                                frequencies.find(frequency => frequency.value === item.frequency).text
                            }}
                        </span>
                    </template>

                    <template #item-actions="item">
                        <button class="btn btn-warning btn-xs" v-tooltip="$t('common.tooltips.edit')" @click="openEditModal(item)">
                            <i class="fa fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-xs m-l-5" v-tooltip="$t('common.tooltips.delete')" @click="deleteRecurringTransaction(item)">
                            <i class="fa fa-trash"></i>
                        </button>
                    </template>

                </EasyDataTable>
            </div>
        </div>
    </div>
    <Teleport to="body">
        <recurring-transaction-modal :mode="modalMode" :transactionData="selectedTransaction"
            :modal="modal"></recurring-transaction-modal>
    </Teleport>
</template>

<script>
import recurringTransactionModal from './recurringTransactionModal.vue';
import * as bootstrap from 'bootstrap';
import recurringTransactionService from '@/services/recurring.transaction.service';
import moment from 'moment';
export default {
    components: {
        'recurring-transaction-modal': recurringTransactionModal
    },
    data() {
        return {
            loading: false,
            headers: [
                { text: this.$t('recurringTransactionList.table.headers.name'), value: 'name' },
                { text: this.$t('recurringTransactionList.table.headers.amount'), value: 'amount' },
                { text: this.$t('recurringTransactionList.table.headers.nextOccurrence'), value: 'nextOccurrence' },
                { text: this.$t('recurringTransactionList.table.headers.labels'), value: 'labels', width: 200 },
                { text: this.$t('recurringTransactionList.table.headers.frequency'), value: 'frequency' },
                { text: this.$t('recurringTransactionList.table.headers.interval'), value: 'interval' },
                { text: this.$t('common.actions'), value: 'actions' }
            ],
            recurringTransactions: [],
            itemsLength: 0,
            serverOptions: {
                page: 1,
                rowsPerPage: 10,
                sortBy: '',
                sortDesc: 'Ascending',
            },
            modal: {},
            modalMode: 'create',
            selectedTransaction: {},
            frequencies: [
                { value: 0, text: this.$t('common.frequency.daily') },
                { value: 1, text: this.$t('common.frequency.weekly') },
                { value: 2, text: this.$t('common.frequency.monthly') },
                { value: 3, text: this.$t('common.frequency.yearly') },
                { value: 4, text: this.$t('common.frequency.lastDayOfTheMonth') },
                { value: 5, text: this.$t('common.frequency.firstBusinessDayOfTheMonth') },
                { value: 6, text: this.$t('common.frequency.lastBusinessDayOfTheMonth') },
                { value: 7, text: this.$t('common.frequency.xTHOfTheMonth') }
            ],
        }
    },
    watch: {
        '$store.state.dashboard.openRecurringTransactionModalTrigger'() {
            this.modalMode = 'create';
            this.selectedTransaction = {};
            this.modal.show();
        },
        serverOptions: {
            deep: true,
            async handler() {
                await this.loadRecurringTransactions();
            }
        }
    },
    methods: {
        openRecurringTransactionModal() {
            this.modalMode = 'create';
            this.selectedTransaction = {};
            this.modal.show();
        },
        async loadRecurringTransactions() {
            this.loading = true;
            var queryParams = {
                PageNumber: this.serverOptions.page,
                PageSize: this.serverOptions.rowsPerPage,
                SortColumn: '',
                SortDirection: 'Ascending',
            }

            try {
                var response = await recurringTransactionService.getAllRecurringTransactions(queryParams);

                if (response.status !== 200) {
                    this.$swal('Error', this.$t('recurringTransactionList.messages.recurringTransactionsLoadError'), 'error');
                    return;
                }

                this.itemsLength = response.data.data.totalRecords;
                this.recurringTransactions = response.data.data.items;
            } catch (e) {
                this.$swal('Error', this.$t('recurringTransactionList.messages.recurringTransactionsLoadError'), 'error');
            } finally {
                this.loading = false;
            }
        },
        formatDate(date) {
            return moment(date).locale(this.$i18n.locale).format('D MMMM YYYY');
        },
        formatCurrency(amount, currencyCode) {
            if (amount == null) return '';

            return new Intl.NumberFormat(this.$i18n?.locale || 'tr-TR', {
                style: 'currency',
                currency: currencyCode,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(amount);
        },
        openEditModal(item) {
            this.modalMode = 'edit';
            this.selectedTransaction = item;
            this.modal.show();
        },
        deleteRecurringTransaction(item) {
            this.$swal({
                title: this.$t('recurringTransactionList.messages.areYouSureDelete'),
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: this.$t('common.yes'),
                cancelButtonText: this.$t('common.no'),
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        var response = await recurringTransactionService.deleteRecurringTransaction(item.id);

                        if (response.status !== 200) {
                            this.$swal({ icon: 'error', text: this.$t('recurringTransactionList.messages.recurringTransactionDeleteError') });
                            return;
                        }

                        const key = item.transaction?.transactionType === 0
                            ? 'recurringTransactionList.messages.incomeDeleteSuccess'
                            : 'recurringTransactionList.messages.expenseDeleteSuccess';
                        this.$swal({ icon: 'success', text: this.$t(key) });
                        await this.loadRecurringTransactions();
                    } catch (e) {
                        this.$swal({ icon: 'error', text: this.$t('recurringTransactionList.messages.recurringTransactionDeleteError') });
                    }
                }
            });
        }
    },
    mounted() {
        const modalElement = document.getElementById('recurringTransactionModal');
        if (modalElement) {
            this.modal = new bootstrap.Modal(modalElement, {
                backdrop: 'static',
                keyboard: false
            });
        }

        this.loadRecurringTransactions();

        if (this.$store.state.dashboard.pendingOpenRecurringTransactionModal) {
            this.$store.dispatch('dashboard/setPendingOpenRecurringTransactionModal', false);
            this.$nextTick(() => {
                this.modalMode = 'create';
                this.selectedTransaction = {};
                this.modal.show();
            });
        }
    },
    beforeUnmount() {
        if (this.modal?.hide) {
            this.modal.hide();
            this.modal.dispose();
        }
    },
}
</script>

<style scoped>
.tx-amount {
    font-weight: 700;
    white-space: nowrap;
}
.amount-positive { color: #10b981; }
.amount-negative { color: #ef4444; }
</style>
