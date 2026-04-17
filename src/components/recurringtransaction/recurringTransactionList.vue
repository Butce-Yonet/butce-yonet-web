<template>
    <div class="card border">
        <div class="card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
            <h5 class="mb-0">{{ $t('recurringTransactionList.title') }}</h5>
            <div class="d-flex align-items-center gap-2">
                <button
                    class="btn btn-sm btn-outline-secondary"
                    @click="showFilters = !showFilters"
                >
                    <i class="fa fa-filter me-1"></i>
                    {{ $t('common.filter') }}
                    <span v-if="activeFilterCount > 0" class="filter-badge">{{ activeFilterCount }}</span>
                </button>
                <button
                    v-if="hasActiveFilters"
                    class="btn btn-sm btn-outline-danger"
                    v-tooltip="$t('common.clearFilters')"
                    @click="clearFilters"
                >
                    <i class="fa fa-times"></i>
                </button>
                <button class="btn btn-success" id="openRecurringTransactionCreateModalButton" @click="openRecurringTransactionModal">
                    <i class="fa fa-plus"></i>
                </button>
            </div>
        </div>

        <!-- Filter Panel -->
        <div class="filter-panel" v-show="showFilters">
            <div class="row g-2">
                <!-- Currency -->
                <div class="col-12 col-sm-6 col-md-4">
                    <label class="filter-label">{{ $t('recurringTransactionList.table.headers.currency') }}</label>
                    <VSelect
                        v-model="filters.currencyId"
                        :options="currencies"
                        label="code"
                        :reduce="c => c.id"
                        :placeholder="$t('common.all')"
                        :clearable="true"
                    >
                        <template #option="currency">
                            <span class="fw-semibold">{{ currency.code }}</span>
                            <span class="text-muted ms-1 small">{{ currency.name }}</span>
                        </template>
                        <template #selected-option="currency">
                            {{ currency.code }} — {{ currency.name }}
                        </template>
                    </VSelect>
                </div>
                <!-- Transaction Type -->
                <div class="col-12 col-sm-6 col-md-4">
                    <label class="filter-label">{{ $t('recurringTransactionList.table.headers.transactionType') }}</label>
                    <select v-model="filters.transactionType" class="form-select form-select-sm">
                        <option :value="null">{{ $t('common.all') }}</option>
                        <option :value="0">{{ $t('common.income') }}</option>
                        <option :value="1">{{ $t('common.expense') }}</option>
                    </select>
                </div>
                <!-- Name -->
                <div class="col-12 col-sm-6 col-md-4">
                    <label class="filter-label">{{ $t('recurringTransactionList.table.headers.name') }}</label>
                    <input v-model="filters.name" class="form-control form-control-sm"
                        :placeholder="$t('recurringTransactionList.table.headers.name')" />
                </div>
                <!-- Amount -->
                <div class="col-12 col-sm-6 col-md-4">
                    <label class="filter-label">{{ $t('recurringTransactionList.table.headers.amount') }}</label>
                    <input v-model="filters.amount" type="number" class="form-control form-control-sm"
                        :placeholder="$t('recurringTransactionList.table.headers.amount')" />
                </div>
                <!-- Labels -->
                <div class="col-12 col-sm-8">
                    <label class="filter-label">{{ $t('recurringTransactionList.table.headers.labels') }}</label>
                    <VSelect
                        v-model="filters.labelIds"
                        :options="labels"
                        label="name"
                        :reduce="l => l.id"
                        :placeholder="$t('common.all')"
                        :clearable="true"
                        multiple
                    >
                        <template #option="label">
                            <span class="label-dot me-1" :style="{ background: label.colorCode }"></span>
                            {{ label.name }}
                        </template>
                        <template #selected-option="label">
                            <span class="label-dot me-1" :style="{ background: label.colorCode }"></span>
                            {{ label.name }}
                        </template>
                    </VSelect>
                </div>
            </div>
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
                        {{ formatCurrency(item.transaction.amount, item.transaction.currency.code) }}
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
            showFilters: false,
            filters: {
                currencyId: null,
                transactionType: null,
                name: '',
                amount: '',
                labelIds: []
            },
            filterDebounce: null,
            loading: false,
            headers: [
                { text: this.$t('recurringTransactionList.table.headers.notebookName'), value: 'notebookName' },
                { text: this.$t('recurringTransactionList.table.headers.currency'), value: 'currencyCode', width: 180 },
                { text: this.$t('recurringTransactionList.table.headers.transactionType'), value: 'transactionType', width: 150 },
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
    computed: {
        currencies() {
            return this.$store.getters['dashboard/getCurrencies'];
        },
        labels() {
            return this.$store.getters['dashboard/getLabels'];
        },
        hasActiveFilters() {
            return (
                this.filters.currencyId !== null ||
                this.filters.transactionType !== null ||
                this.filters.name ||
                this.filters.amount !== '' ||
                this.filters.labelIds.length > 0
            );
        },
        activeFilterCount() {
            let count = 0;
            if (this.filters.currencyId !== null)      count++;
            if (this.filters.transactionType !== null) count++;
            if (this.filters.name)                     count++;
            if (this.filters.amount !== '')            count++;
            if (this.filters.labelIds.length > 0)      count++;
            return count;
        }
    },
    watch: {
        '$store.state.notebook.selectedNotebook': {
            deep: true,
            async handler() {
                this.serverOptions.page = 1;
                await this.loadRecurringTransactions();
            }
        },
        serverOptions: {
            deep: true,
            async handler() {
                await this.loadRecurringTransactions();
            }
        },
        filters: {
            deep: true,
            handler() {
                clearTimeout(this.filterDebounce);
                this.filterDebounce = setTimeout(() => {
                    this.serverOptions.page = 1;
                    this.loadRecurringTransactions();
                }, 400);
            }
        }
    },
    methods: {
        clearFilters() {
            this.filters = {
                currencyId: null,
                transactionType: null,
                name: '',
                amount: '',
                labelIds: []
            };
        },
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
                CurrencyId:      this.filters.currencyId      ?? null,
                TransactionType: this.filters.transactionType !== null ? this.filters.transactionType : null,
                Name:            this.filters.name            || null,
                Amount:          this.filters.amount !== ''   ? this.filters.amount : null,
                LabelIds:        this.filters.labelIds.length > 0 ? this.filters.labelIds : null,
            }

            try {
                var response = await recurringTransactionService.getAllRecurringTransactions(
                    this.$store.state.notebook.selectedNotebook.id,
                    queryParams
                );

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
            return moment(date).format('DD-MM-YYYY');
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
                        var response = await recurringTransactionService.deleteRecurringTransaction(
                            this.$store.state.notebook.selectedNotebook.id,
                            item.id
                        );

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

        if (this.$store.state.notebook.selectedNotebook.id > 0)
            this.loadRecurringTransactions()
    }
}
</script>

<style scoped>
/* Filter panel */
.filter-panel {
    padding: 14px 20px;
    background: #f9fafb;
    border-bottom: 1.5px solid #e5e7eb;
}

.filter-label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 4px;
}

/* Filter badge */
.filter-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    background: #10b981;
    color: #fff;
    border-radius: 50%;
    font-size: 11px;
    font-weight: 700;
    margin-left: 4px;
}

.label-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
}
</style>
