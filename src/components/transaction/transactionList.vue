<template>
    <div>
        <div class="card">
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
                        <button class="btn btn-primary float-end">
                            <i class="fa fa-search"></i>
                        </button>
                    </div>
                    <div class="col-sm-12 col-md-12 m-t-15">
                        <EasyDataTable v-model:server-options="serverOptions" :server-items-length="itemsLength"
                            :headers="headers" :items="transactions" :loading="loading">

                            <template #empty-message>
                                <span>{{ $t('common.noDataText') }}</span>
                            </template>

                        </EasyDataTable>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <transaction-modal 
        :mode="modalMode" 
        :transactionData="selectedTransaction"
        :modal="modal"></transaction-modal>
</template>

<script>
import transactionModal from '@/components/transaction/transactionModal.vue';
import * as bootstrap from 'bootstrap';
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
                    text: 'Defter',
                    value: 'notebookName'
                },
                {
                    text: 'Para Birimi',
                    value: 'currencyCode'
                },
                {
                    text: 'İşlem Tipi',
                    value: 'transactionType'
                },
                {
                    text: 'Ad',
                    value: 'name'
                },
                {
                    text: 'Açıklama',
                    value: 'description'
                },
                {
                    text: 'Tutar',
                    value: 'amount'
                },
                {
                    text: 'Tarih',
                    value: 'transactionDate'
                },
                {
                    text: 'Kategori',
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
                sortType: '',
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
        }
    },
    methods: {
        async loadTransactions() {

        },
        openTransactionModal() {
            this.modalMode = 'create';
            this.selectedTransaction = {};
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
    }
}
</script>

<style scoped>
.mobile-only {
    @media (min-width: 768px) {
        margin: 0px !important;
    }
}
</style>