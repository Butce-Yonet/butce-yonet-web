<template>
    <div class="card border">
        <div class="card-header d-flex align-items-center justify-content-between">
            <h5>{{ $t('recurringTransactionList.title') }}</h5>
            <button class="btn btn-success float-end" @click="openRecurringTransactionModal">
                <i class="fa fa-plus"></i>
            </button>
        </div>
        <div class="card-body">
            <div class="col-sm-12 col-md-12 m-t-15">
                <EasyDataTable v-model:server-options="serverOptions" :server-items-length="itemsLength"
                    :headers="headers" :items="recurringTransactions" :loading="loading">
                    <template #empty-message>
                        <span>{{ $t('common.noDataText') }}</span>
                    </template>

                    <template #item-notebookName="item">
                        <span class="badge badge-primary">
                            {{ item.notebook.name }}
                        </span>
                    </template>

                    <template #item-currencyCode="item">
                        <span class="badge badge-success">
                            {{ item.transaction.currency.code }} - {{ item.transaction.currency.name }}
                        </span>
                    </template>

                    <template #item-transactionType="item">
                        <span v-if="item.transaction.transactionType == 0" class="badge badge-success">{{
                            $t('common.income') }}</span>
                        <span v-else class="badge badge-danger">{{ $t('common.expense') }}</span>
                    </template>

                    <template #item-amount="item">
                        {{ item.transaction.amount }} {{ item.transaction.currency.symbol }}
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
                        <button class="btn btn-warning btn-xs" @click="openEditModal(item)">
                            <i class="fa fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-xs m-l-5" @click="deleteRecurringTransaction(item)">
                            <i class="fa fa-trash"></i>
                        </button>
                    </template>

                </EasyDataTable>
            </div>
        </div>
    </div>
    <recurring-transaction-modal :mode="modalMode" :transactionData="selectedTransaction"
        :modal="modal"></recurring-transaction-modal>
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
                {
                    text: this.$t('recurringTransactionList.table.headers.notebookName'),
                    value: 'notebookName'
                },
                {
                    text: this.$t('recurringTransactionList.table.headers.currency'),
                    value: 'currencyCode'
                },
                {
                    text: this.$t('recurringTransactionList.table.headers.transactionType'),
                    value: 'transactionType'
                },
                {
                    text: this.$t('recurringTransactionList.table.headers.name'),
                    value: 'name'
                },
                {
                    text: this.$t('recurringTransactionList.table.headers.amount'),
                    value: 'amount'
                },
                {
                    text: this.$t('recurringTransactionList.table.headers.nextOccurrence'),
                    value: 'nextOccurrence'
                },
                {
                    text: this.$t('recurringTransactionList.table.headers.labels'),
                    value: 'labels'
                },
                {
                    text: this.$t('recurringTransactionList.table.headers.frequency'),
                    value: 'frequency'
                },
                {
                    text: this.$t('recurringTransactionList.table.headers.interval'),
                    value: 'interval'
                },
                {
                    text: this.$t('common.actions'),
                    value: 'actions'
                }
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
        '$store.state.notebook.selectedNotebook': {
            deep: true,
            async handler(newVal, oldVal) {
                await this.loadRecurringTransactions();
            }
        },
        serverOptions: {
            deep: true,
            async handler(newVal, oldVal) {
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
                var response = await recurringTransactionService.getAllRecurringTransactions(this.$store.state.notebook.selectedNotebook.id, queryParams);

                if (response.status !== 200) {
                    this.$swal('Error', this.$t('recurringTransactionList.messages.recurringTransactionsLoadError'), 'error');
                    return;
                }

                this.itemsLength = response.data.data.totalRecords;
                this.recurringTransactions = response.data.data.items;
                console.log(this.recurringTransactions)
            } catch (e) {
                this.$swal('Error', this.$t('recurringTransactionList.messages.recurringTransactionsLoadError'), 'error');
            } finally {
                this.loading = false;
            }
        },
        formatDate(date) {
            return moment(date).format('DD-MM-YYYY');
        },
        openEditModal(item) {
            this.modalMode = 'edit';
            this.selectedTransaction = item;
            this.modal.show();
        },
        async deleteRecurringTransaction(item) {

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

        if (this.$store.state.notebook.selectedNotebook.id > 0)
            this.loadRecurringTransactions()
    }
}
</script>