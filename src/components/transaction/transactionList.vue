<template>
    <div>
        <div class="card border">
            <div class="card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
                <h5 class="mb-0">{{ $t('transactionList.title') }}</h5>
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
                </div>
            </div>

            <!-- Filter Panel -->
            <div class="filter-panel" v-show="showFilters">
                <div class="mb-2">
                    <date-range-preset-picker v-model="filters.transactionDate" />
                </div>
                <div class="row g-2">
                    <!-- Currency -->
                    <div class="col-12 col-sm-6 col-md-4">
                        <label class="filter-label">{{ $t('transactionList.table.headers.currency') }}</label>
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
                        <label class="filter-label">{{ $t('transactionList.table.headers.transactionType') }}</label>
                        <select v-model="filters.transactionType" class="form-select form-select-sm">
                            <option :value="null">{{ $t('common.all') }}</option>
                            <option :value="0">{{ $t('common.income') }}</option>
                            <option :value="1">{{ $t('common.expense') }}</option>
                            <option :value="2">{{ $t('common.saving') }}</option>
                        </select>
                    </div>
                    <!-- Date -->
                    <div class="col-12 col-sm-6 col-md-4">
                        <label class="filter-label">{{ $t('transactionList.table.headers.transactionDate') }}</label>
                        <VueDatePicker
                            v-model="filters.transactionDate"
                            range
                            :time-config="{ enableTimePicker: false }"
                            auto-apply
                            :placeholder="$t('common.all')"
                            :locale="dateLocale"
                        />
                    </div>
                    <!-- Name -->
                    <div class="col-12 col-sm-6 col-md-4">
                        <label class="filter-label">{{ $t('transactionList.table.headers.name') }}</label>
                        <input v-model="filters.name" class="form-control form-control-sm"
                            :placeholder="$t('transactionList.table.headers.name')" />
                    </div>
                    <!-- Description -->
                    <div class="col-12 col-sm-6 col-md-4">
                        <label class="filter-label">{{ $t('transactionList.table.headers.description') }}</label>
                        <input v-model="filters.description" class="form-control form-control-sm"
                            :placeholder="$t('transactionList.table.headers.description')" />
                    </div>
                    <!-- Amount -->
                    <div class="col-12 col-sm-6 col-md-4">
                        <label class="filter-label">{{ $t('transactionList.table.headers.amount') }}</label>
                        <input v-model="filters.amount" type="number" class="form-control form-control-sm"
                            :placeholder="$t('transactionList.table.headers.amount')" />
                    </div>
                    <!-- Labels -->
                    <div class="col-12">
                        <label class="filter-label">{{ $t('transactionList.table.headers.labels') }}</label>
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
                <div class="col-sm-12 col-md-12">
                    <EasyDataTable
                        id="transactionList"
                        v-model:server-options="serverOptions"
                        :server-items-length="itemsLength"
                        :headers="headers"
                        :items="transactions"
                        :loading="loading"
                    >
                        <template #empty-message>
                            <span>{{ $t('common.noDataText') }}</span>
                        </template>

                        <template #item-transactionDate="item">
                            <span>{{ formatDate(item.transactionDate) }}</span>
                        </template>

                        <template #item-amount="item">
                            <span class="tx-amount" :class="amountClass(item)">
                                {{ amountSign(item) }}{{ formatCurrency(item.amount, item.currency.code) }}
                            </span>
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
                            <template v-if="item.transactionType === 2">
                                <span class="badge badge-light-secondary" v-tooltip="$t('transactionList.savingLocked')">
                                    <i class="fa fa-lock"></i>
                                </span>
                            </template>
                            <template v-else>
                                <button class="btn btn-warning btn-xs" v-tooltip="$t('common.tooltips.edit')" @click="openEditModal(item)">
                                    <i class="fa fa-edit"></i>
                                </button>
                                <button class="btn btn-danger btn-xs m-l-5" v-tooltip="$t('common.tooltips.delete')" @click="deleteTransaction(item)">
                                    <i class="fa fa-trash"></i>
                                </button>
                            </template>
                        </template>

                    </EasyDataTable>
                </div>
            </div>
        </div>
    </div>
    <Teleport to="body">
        <transaction-modal :mode="modalMode" :transactionData="selectedTransaction" :modal="modal"></transaction-modal>
    </Teleport>
</template>

<script>
import transactionModal from '@/components/transaction/transactionModal.vue';
import * as bootstrap from 'bootstrap';
import transactionService from '@/services/transaction.service';
import moment from 'moment'
import { useDateLocale } from '@/composables/useDateLocale';
import { getDefaultDateRange, isDefaultDateRange } from '@/composables/dateRangePresets';
import DateRangePresetPicker from '@/components/common/DateRangePresetPicker.vue';

export default {
    setup() {
        const { dateLocale } = useDateLocale();
        return { dateLocale };
    },
    components: {
        'transaction-modal': transactionModal,
        'date-range-preset-picker': DateRangePresetPicker
    },
    data() {
        return {
            showFilters: false,
            filters: {
                currencyId: null,
                transactionType: null,
                name: '',
                description: '',
                amount: '',
                transactionDate: getDefaultDateRange(),
                labelIds: []
            },
            filterDebounce: null,
            loading: false,
            headers: [
                { text: this.$t('transactionList.table.headers.name'), value: 'name' },
                { text: this.$t('transactionList.table.headers.description'), value: 'description' },
                { text: this.$t('transactionList.table.headers.amount'), value: 'amount' },
                { text: this.$t('transactionList.table.headers.transactionDate'), value: 'transactionDate' },
                { text: this.$t('transactionList.table.headers.labels'), value: 'labels' },
                { text: this.$t('common.actions'), value: 'actions' }
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
                this.filters.description ||
                this.filters.amount !== '' ||
                !isDefaultDateRange(this.filters.transactionDate) ||
                this.filters.labelIds.length > 0
            );
        },
        activeFilterCount() {
            let count = 0;
            if (this.filters.currencyId !== null)        count++;
            if (this.filters.transactionType !== null)   count++;
            if (this.filters.name)                       count++;
            if (this.filters.description)                count++;
            if (this.filters.amount !== '')              count++;
            if (!isDefaultDateRange(this.filters.transactionDate)) count++;
            if (this.filters.labelIds.length > 0)        count++;
            return count;
        }
    },
    watch: {
        '$store.state.dashboard.openTransactionModalTrigger'() {
            this.modalMode = 'create';
            this.selectedTransaction = {};
            this.modal.show();
        },
        serverOptions: {
            deep: true,
            async handler() {
                await this.loadTransactions();
            }
        },
        filters: {
            deep: true,
            handler() {
                clearTimeout(this.filterDebounce);
                this.filterDebounce = setTimeout(() => {
                    this.serverOptions.page = 1;
                    this.loadTransactions();
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
                description: '',
                amount: '',
                transactionDate: getDefaultDateRange(),
                labelIds: []
            };
        },
        async loadTransactions() {
            this.loading = true;

            const dateStart = this.filters.transactionDate?.[0];
            const dateEnd   = this.filters.transactionDate?.[1];

            var queryParams = {
                PageNumber: this.serverOptions.page,
                PageSize: this.serverOptions.rowsPerPage,
                SortColumn: '',
                SortDirection: 'Ascending',
                StartTime: dateStart
                    ? new Date(dateStart.getFullYear(), dateStart.getMonth(), dateStart.getDate(), 0, 0, 0).toISOString()
                    : null,
                EndTime: dateEnd
                    ? new Date(dateEnd.getFullYear(), dateEnd.getMonth(), dateEnd.getDate(), 23, 59, 59).toISOString()
                    : null,
                Name:            this.filters.name            || null,
                Description:     this.filters.description     || null,
                Amount:          this.filters.amount !== ''   ? this.filters.amount : null,
                CurrencyId:      this.filters.currencyId      ?? null,
                TransactionType: this.filters.transactionType !== null ? this.filters.transactionType : null,
                LabelIds:        this.filters.labelIds.length > 0 ? this.filters.labelIds : [],
            };

            try {
                var response = await transactionService.getAllTransactions(queryParams);

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
            return moment(date).locale(this.$i18n.locale).format('D MMMM YYYY');
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
                        var response = await transactionService.deleteTransaction(item.id);
                        if (response.status === 200) {
                            const key = item.transactionType === 0
                                ? 'transactionList.messages.incomeDeleteSuccess'
                                : 'transactionList.messages.expenseDeleteSuccess';
                            this.$swal(this.$t(key), '', 'success');
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
        },
        formatCurrency(amount, currencyCode) {
            if (amount == null) return '';
            return new Intl.NumberFormat('tr-TR', {
                style: 'currency',
                currency: currencyCode,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(amount);
        },
        amountClass(item) {
            if (item.transactionType === 0) return 'amount-positive';
            if (item.transactionType === 2) return 'amount-saving';
            return 'amount-negative';
        },
        amountSign(item) {
            if (item.transactionType === 1) return '-';
            return '+';
        },
    },
    mounted() {
        const modalElement = document.getElementById('transactionModal');
        if (modalElement) {
            this.modal = new bootstrap.Modal(modalElement, {
                backdrop: 'static',
                keyboard: false
            });
        }
        this.loadTransactions();

        if (this.$store.state.dashboard.pendingOpenTransactionModal) {
            this.$store.dispatch('dashboard/setPendingOpenTransactionModal', false);
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
.amount-saving { color: #3b82f6; }

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

/* Küçültülmüş VueDatePicker */
.filter-panel :deep(.dp__input) {
    font-size: 13px;
    height: 31px;
    min-height: unset;
    padding-top: 4px;
    padding-bottom: 4px;
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
