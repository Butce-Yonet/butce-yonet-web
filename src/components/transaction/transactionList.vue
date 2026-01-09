<template>
    <div>
        <div class="card border">
            <div class="card-header d-flex align-items-center justify-content-between">
                <h5>{{ $t('transactionList.title') }}</h5>
                <button class="btn btn-success float-end" @click="openTransactionModal">
                    <i class="fa fa-plus"></i>
                </button>
            </div>
            <div class="card-body">
                <div class="row d-flex align-items-center justify-content-end">
                    <div class="col-sm-12 offset-md-8 col-md-3">
                        <VueDatePicker v-model="dates" range multi-calendars
                            :time-config="{ enableTimePicker: false }" />
                    </div>
                    <div class="col-sm-12 col-md-1 m-t-10 mobile-only">
                        <button class="btn btn-primary float-end" @click="loadTransactions">
                            <i class="fa fa-search"></i>
                        </button>
                    </div>
                    <div class="col-sm-12 col-md-12 m-t-15">
                        <EasyDataTable v-model:server-options="serverOptions" :server-items-length="itemsLength"
                            :headers="headers" :items="transactions" :loading="loading">

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
                                    {{ item.currency.code }} - {{ item.currency.name }}
                                </span>
                            </template>

                            <template #item-transactionType="item">
                                <span v-if="item.transactionType == 0" class="badge badge-success">{{
                                    $t('common.income') }}</span>
                                <span v-else class="badge badge-danger">{{ $t('common.expense') }}</span>
                            </template>

                            <template #item-transactionDate="item">
                                <span>{{ formatDate(item.transactionDate) }}</span>
                            </template>

                            <template #item-amount="item">
                                {{ item.amount }} {{ item.currency.symbol }}
                            </template>

                            <template #item-labels="item">
                                <span v-for="label in item.labels" class="badge"
                                    :style="{ backgroundColor: label.colorCode }">
                                    {{ label.name }}
                                </span>

                                <span v-if="item.labels.length < 1">
                                    <span class="badge badge-danger">
                                        <i class="fa fa-exclamation"></i>
                                        {{ $t('transactionList.noLabel') }}
                                    </span>
                                </span>
                            </template>

                            <template #item-actions="item">
                                <button class="btn btn-warning btn-xs" @click="openEditModal(item)">
                                    <i class="fa fa-edit"></i>
                                </button>
                                <button class="btn btn-danger btn-xs m-l-5" @click="deleteTransaction(item)">
                                    <i class="fa fa-trash"></i>
                                </button>
                            </template>

                        </EasyDataTable>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <transaction-modal :mode="modalMode" :transactionData="selectedTransaction" :modal="modal"></transaction-modal>
</template>

<script>
import transactionModal from '@/components/transaction/transactionModal.vue';
import * as bootstrap from 'bootstrap';
import transactionService from '@/services/transaction.service';
import moment from 'moment'
export default {
    components: {
        'transaction-modal': transactionModal
    },
    data() {
        return {
            dates: [
                new Date(new Date().setMonth(new Date().getMonth() - 1)),
                new Date()
            ],
            loading: false,
            headers: [
                {
                    text: this.$t('transactionList.table.headers.notebookName'),
                    value: 'notebookName'
                },
                {
                    text: this.$t('transactionList.table.headers.currency'),
                    value: 'currencyCode'
                },
                {
                    text: this.$t('transactionList.table.headers.transactionType'),
                    value: 'transactionType'
                },
                {
                    text: this.$t('transactionList.table.headers.name'),
                    value: 'name'
                },
                {
                    text: this.$t('transactionList.table.headers.description'),
                    value: 'description'
                },
                {
                    text: this.$t('transactionList.table.headers.amount'),
                    value: 'amount'
                },
                {
                    text: this.$t('transactionList.table.headers.transactionDate'),
                    value: 'transactionDate'
                },
                {
                    text: this.$t('transactionList.table.headers.labels'),
                    value: 'labels'
                },
                {
                    text: this.$t('common.actions'),
                    value: 'actions'
                }
            ],
            transactions: [],
            itemsLength: 0,
            serverOptions: {
                page: 1,
                rowsPerPage: 10,
                sortBy: '',
                sortType: 'Ascending',
            },
            modal: {},
            modalMode: 'create',
            selectedTransaction: {}
        }
    },
    watch: {
        '$store.state.notebook.selectedNotebook': {
            deep: true,
            async handler(newVal, oldVal) {
                await this.loadTransactions();
            }
        },
        serverOptions: {
            deep: true,
            async handler(newVal, oldVal) {
                await this.loadTransactions();
            }
        }
    },
    methods: {
        async loadTransactions() {
            this.loading = true;
            var queryParams = {
                PageNumber: this.serverOptions.page,
                PageSize: this.serverOptions.rowsPerPage,
                SortColumn: '',
                SortDirection: 'Ascending',
                StartTime: this.dates[0] ? this.dates[0].toISOString() : null,
                EndTime: this.dates[1] ? this.dates[1].toISOString() : null
            };

            try {
                var response = await transactionService.getAllTransactions(this.$store.state.notebook.selectedNotebook.id, queryParams);

                if (response.status !== 200) {
                    this.$swal('Error', this.$t('transactionList.messages.transactionsLoadError'), 'error');
                    return;
                }

                this.itemsLength = response.data.data.totalRecords;
                this.transactions = response.data.data.items;

            } catch (e) {
                this.$swal('Error', this.$t('transactionList.messages.transactionsLoadError'), 'error');
            } finally {
                this.loading = false;
            }
        },
        openTransactionModal() {
            this.modalMode = 'create';
            this.selectedTransaction = {};
            this.modal.show();
        },
        formatDate(date) {
            return moment(date).format('DD-MM-YYYY');
        },
        deleteTransaction(item) {
            this.$swal({
                title: this.$t('transactionList.messages.areYouSureDeleteTransaction'),
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: this.$t('common.yes'),
                cancelButtonText: this.$t('common.no')
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        var response = await transactionService.deleteTransaction(this.$store.state.notebook.selectedNotebook.id, item.id);

                        if (response.status === 200) {
                            this.$swal(this.$t('transactionList.messages.transactionDeleteSuccess'), '', 'success');
                            await this.loadTransactions();
                        } else {
                            this.$swal('Error', this.$t('transactionList.messages.transactionDeleteError'), 'error');
                        }
                    } catch (e) {
                        this.$swal('Error', this.$t('transactionList.messages.transactionDeleteError'), 'error');
                    }
                }
            });
        },
        openEditModal(item) {
            this.modalMode = 'edit';
            this.selectedTransaction = item;
            this.modal.show();
        }
    },
    mounted() {
        const modalElement = document.getElementById('transactionModal');
        if (modalElement) {
            this.modal = new bootstrap.Modal(modalElement, {
                backdrop: 'static',
                keyboard: false
            });
        }

        if (this.$store.state.notebook.selectedNotebook.id > 0)
            this.loadTransactions()
    },
}
</script>

<style scoped>
.mobile-only {
    @media (min-width: 768px) {
        margin: 0px !important;
    }
}
</style>