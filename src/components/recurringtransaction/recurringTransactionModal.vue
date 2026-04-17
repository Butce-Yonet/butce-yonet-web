<template>
    <div class="modal fade modal-bookmark" id="recurringTransactionModal" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-dialog-centered modal-xl" role="document">
            <div class="modal-content border-0 shadow-lg">

                <!-- Header -->
                <div class="modal-header border-0 pb-0 px-4 pt-4">
                    <div class="d-flex align-items-center gap-3">
                        <div class="rt-icon-wrap" :class="mode === 'edit' ? 'icon-edit' : 'icon-create'">
                            <i :class="mode === 'edit' ? 'fa fa-pencil' : 'fa fa-repeat'"></i>
                        </div>
                        <div>
                            <p class="text-muted mb-0 small">
                                {{ mode === 'create'
                                    ? $t('recurringTransactionList.transactionModal.createTitle')
                                    : $t('recurringTransactionList.transactionModal.editTitle') }}
                            </p>
                            <h5 class="modal-title mb-0 fw-semibold">
                                {{ $store.state.notebook.selectedNotebook.name }}
                            </h5>
                        </div>
                    </div>
                    <button class="btn-close" type="button" aria-label="Close" @click="closeModal"></button>
                </div>

                <!-- Body -->
                <div class="modal-body px-4 pt-3 pb-4">
                    <form novalidate @submit.prevent="save">

                        <!-- Section 1: Recurring Info -->
                        <div class="form-section mb-4">
                            <div class="form-section-title">
                                <i class="fa fa-repeat me-2"></i>
                                {{ $t('recurringTransactionList.transactionModal.recurringInfo') }}
                            </div>
                            <div class="form-section-body">
                                <div class="row g-3">

                                    <!-- Name -->
                                    <div class="col-sm-12 col-md-6">
                                        <label class="field-label">
                                            {{ $t('recurringTransactionList.transactionModal.form.placeholder.name') }}
                                            <span class="text-danger ms-1" v-if="errors.name">*</span>
                                        </label>
                                        <input
                                            class="form-control rt-input"
                                            :class="{ 'is-invalid': errors.name }"
                                            v-model="form.name"
                                            :placeholder="$t('recurringTransactionList.transactionModal.form.placeholder.name')"
                                        />
                                    </div>

                                    <!-- Description -->
                                    <div class="col-sm-12 col-md-6">
                                        <label class="field-label">
                                            {{ $t('recurringTransactionList.transactionModal.form.placeholder.description') }}
                                        </label>
                                        <input
                                            class="form-control rt-input"
                                            v-model="form.description"
                                            :placeholder="$t('recurringTransactionList.transactionModal.form.placeholder.description')"
                                        />
                                    </div>

                                    <!-- Start Date -->
                                    <div class="col-sm-12 col-md-6">
                                        <label class="field-label">
                                            {{ $t('recurringTransactionList.transactionModal.form.placeholder.startDate') }}
                                            <span class="text-danger ms-1" v-if="errors.startDate">*</span>
                                        </label>
                                        <VueDatePicker
                                            v-model="form.startDate"
                                            :time-config="{ enableTimePicker: false }"
                                            auto-apply
                                            teleport
                                        />
                                    </div>

                                    <!-- End Date -->
                                    <div class="col-sm-12 col-md-6">
                                        <label class="field-label">
                                            {{ $t('recurringTransactionList.transactionModal.form.placeholder.endDate') }}
                                            <span class="text-danger ms-1" v-if="errors.endDate">*</span>
                                        </label>
                                        <VueDatePicker
                                            v-model="form.endDate"
                                            :time-config="{ enableTimePicker: false }"
                                            auto-apply
                                            teleport
                                        />
                                    </div>

                                    <!-- Frequency -->
                                    <div class="col-12">
                                        <label class="field-label">
                                            {{ $t('recurringTransactionList.transactionModal.form.placeholder.frequency') }}
                                            <span class="text-danger ms-1" v-if="errors.frequency">*</span>
                                        </label>
                                        <div class="frequency-grid">
                                            <button
                                                v-for="freq in frequencies"
                                                :key="freq.value"
                                                type="button"
                                                class="freq-btn"
                                                :class="{ 'freq-btn--active': form.frequency === freq.value }"
                                                @click="form.frequency = freq.value"
                                            >
                                                {{ freq.text }}
                                            </button>
                                        </div>
                                    </div>

                                    <!-- Interval -->
                                    <div class="col-sm-12 col-md-4">
                                        <label class="field-label">
                                            {{ $t('recurringTransactionList.transactionModal.form.placeholder.interval') }}
                                            <span class="text-danger ms-1" v-if="errors.interval">*</span>
                                        </label>
                                        <div class="input-group">
                                            <span class="input-group-text rt-input-addon">
                                                <i class="fa fa-refresh"></i>
                                            </span>
                                            <input
                                                type="number"
                                                class="form-control rt-input"
                                                :class="{ 'is-invalid': errors.interval }"
                                                v-model="form.interval"
                                                min="0"
                                            />
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>

                        <!-- Section 2: Transaction Info (create only) -->
                        <div class="form-section mb-4" v-if="mode === 'create'">
                            <div class="form-section-title">
                                <i class="fa fa-exchange me-2"></i>
                                {{ $t('recurringTransactionList.transactionModal.transactionInfo') }}
                            </div>
                            <div class="form-section-body">

                                <!-- Type Toggle -->
                                <div class="type-toggle mb-3">
                                    <button
                                        type="button"
                                        class="type-btn"
                                        :class="form.transaction.transactionType === 0 ? 'type-btn--income active' : 'type-btn--income'"
                                        @click="form.transaction.transactionType = 0"
                                    >
                                        <i class="fa fa-arrow-up me-2"></i>
                                        {{ $t('common.income') }}
                                    </button>
                                    <button
                                        type="button"
                                        class="type-btn"
                                        :class="form.transaction.transactionType === 1 ? 'type-btn--expense active' : 'type-btn--expense'"
                                        @click="form.transaction.transactionType = 1"
                                    >
                                        <i class="fa fa-arrow-down me-2"></i>
                                        {{ $t('common.expense') }}
                                    </button>
                                </div>

                                <div class="row g-3">

                                    <!-- Tx Name -->
                                    <div class="col-sm-12 col-md-6">
                                        <label class="field-label">
                                            {{ $t('recurringTransactionList.transactionModal.form.placeholder.transaction.name') }}
                                            <span class="text-danger ms-1" v-if="errors.transaction?.name">*</span>
                                        </label>
                                        <input
                                            class="form-control rt-input"
                                            :class="{ 'is-invalid': errors.transaction?.name }"
                                            v-model="form.transaction.name"
                                            :placeholder="$t('recurringTransactionList.transactionModal.form.placeholder.transaction.name')"
                                        />
                                    </div>

                                    <!-- Tx Description -->
                                    <div class="col-sm-12 col-md-6">
                                        <label class="field-label">
                                            {{ $t('recurringTransactionList.transactionModal.form.placeholder.transaction.description') }}
                                        </label>
                                        <input
                                            class="form-control rt-input"
                                            v-model="form.transaction.description"
                                            :placeholder="$t('recurringTransactionList.transactionModal.form.placeholder.transaction.description')"
                                        />
                                    </div>

                                    <!-- Amount -->
                                    <div class="col-sm-12 col-md-6">
                                        <label class="field-label">
                                            {{ $t('recurringTransactionList.transactionModal.form.placeholder.transaction.amount') }}
                                            <span class="text-danger ms-1" v-if="errors.transaction?.amount">*</span>
                                        </label>
                                        <div class="input-group">
                                            <span class="input-group-text rt-input-addon">
                                                <i class="fa fa-money"></i>
                                            </span>
                                            <input
                                                type="number"
                                                class="form-control rt-input"
                                                :class="{ 'is-invalid': errors.transaction?.amount }"
                                                v-model="form.transaction.amount"
                                                :placeholder="$t('recurringTransactionList.transactionModal.form.placeholder.transaction.amount')"
                                            />
                                        </div>
                                    </div>

                                    <!-- Currency -->
                                    <div class="col-sm-12 col-md-6">
                                        <label class="field-label">
                                            {{ $t('recurringTransactionList.transactionModal.form.placeholder.transaction.currency') }}
                                            <span class="text-danger ms-1" v-if="errors.transaction?.currencyId">*</span>
                                        </label>
                                        <VSelect
                                            :options="currencies"
                                            v-model="form.transaction.currencyId"
                                            label="code"
                                            :reduce="c => c.id"
                                            :placeholder="$t('recurringTransactionList.transactionModal.form.placeholder.transaction.currency')"
                                        >
                                            <template #option="currency">
                                                <span class="fw-semibold">{{ currency.code }}</span>
                                                <span class="text-muted ms-1 small">{{ currency.name }}</span>
                                            </template>
                                            <template #selected-option="currency">
                                                {{ currency.code }} - {{ currency.name }}
                                            </template>
                                        </VSelect>
                                    </div>

                                    <!-- Labels -->
                                    <div class="col-sm-12 col-md-12">
                                        <label class="field-label">
                                            {{ $t('recurringTransactionList.transactionModal.form.placeholder.transaction.labels') }}
                                        </label>
                                        <VSelect
                                            :options="labels"
                                            v-model="form.transaction.labels"
                                            label="name"
                                            :reduce="c => c.id"
                                            multiple
                                            :placeholder="$t('recurringTransactionList.transactionModal.form.placeholder.transaction.labels')"
                                        >
                                            <template #option="label">
                                                <span class="label-dot me-2" :style="{ background: label.colorCode }"></span>
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
                        </div>

                        <!-- Footer -->
                        <div class="d-flex gap-2 justify-content-end">
                            <button class="btn btn-light px-4" type="button" @click="closeModal">
                                {{ $t('common.cancel') }}
                            </button>
                            <button
                                class="btn px-4 save-btn"
                                :class="mode === 'edit' ? 'btn-warning' : 'btn-success'"
                                :disabled="!isValid || submitting"
                                type="submit"
                            >
                                <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                                <i v-else class="fa me-2" :class="mode === 'edit' ? 'fa-check' : 'fa-plus'"></i>
                                {{ $t('common.save') }}
                            </button>
                        </div>

                    </form>
                </div>

            </div>
        </div>
    </div>
</template>

<script>
import * as yup from 'yup';
import { createYupValidator } from '@/services/validator.service';
import recurringTransactionService from '@/services/recurring.transaction.service';
export default {
    props: {
        modal: {
            type: Object,
            required: true
        },
        mode: {
            type: String,
            required: true
        },
        transactionData: {
            type: Object,
            required: false
        }
    },
    data() {
        return {
            form: {
                name: '',
                description: '',
                startDate: new Date(),
                endDate: new Date(),
                frequency: 0,
                interval: 0,
                transaction: {
                    name: '',
                    description: '',
                    amount: 0,
                    currencyId: 0,
                    transactionType: 0,
                    transactionDate: new Date(),
                    labels: []
                }
            },
            validator: null,
            errors: {},
            isValid: false,
            submitting: false,
            currencies: this.$store.getters['dashboard/getCurrencies'],
            transactionTypes: [
                { value: 0, text: this.$t('common.income') },
                { value: 1, text: this.$t('common.expense') }
            ],
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
            labels: this.$store.getters['notebook/getNotebookLabels']
        }
    },
    watch: {
        modal: {
            deep: true,
            async handler(newVal) {
                this.currencies = this.$store.getters['dashboard/getCurrencies'];
                this.labels = this.$store.getters['dashboard/getLabels'];
                if (newVal._isShown) {
                    if (this.mode === 'edit' && this.transactionData) {
                        this.form = {
                            name: this.transactionData.name,
                            description: this.transactionData.description,
                            startDate: new Date(this.transactionData.startDate),
                            endDate: new Date(this.transactionData.endDate),
                            frequency: this.transactionData.frequency,
                            interval: this.transactionData.interval,
                            transaction: {
                                name: this.transactionData.transaction.name,
                                description: this.transactionData.transaction.description,
                                amount: this.transactionData.transaction.amount,
                                currencyId: this.transactionData.transaction.currency.id,
                                transactionType: this.transactionData.transaction.transactionType,
                                transactionDate: new Date(this.transactionData.transaction.transactionDate),
                                labels: this.transactionData.transaction.labels.map(label => label.id)
                            }
                        }
                    } else if (this.mode === 'create') {
                        this.form.transaction.currencyId = this.getDefaultCurrencyId();
                    }
                } else {
                    this.form = {
                        name: '',
                        description: '',
                        startDate: new Date(),
                        endDate: new Date(),
                        frequency: 0,
                        interval: 0,
                        transaction: {
                            name: '',
                            description: '',
                            amount: 0,
                            currencyId: this.getDefaultCurrencyId(),
                            transactionType: 0,
                            transactionDate: new Date(),
                            labels: []
                        }
                    }
                }
            }
        },
        form: {
            deep: true,
            async handler(newVal) {
                this.isValid = await this.validator.validateForm(this.form, this.errors);
            }
        }
    },
    methods: {
        getDefaultCurrencyId() {
            const list = this.$store.getters['dashboard/getCurrencies'];
            const byRank = list.find(c => c.rank === 1);
            if (byRank) return byRank.id;
            const byCode = list.find(c => c.code === 'TRY');
            return byCode ? byCode.id : '';
        },
        closeModal() {
            this.modal.hide();
        },
        async save() {
            if (this.mode === 'create') {
                await this.createRecurringTransaction();
            } else if (this.mode === 'edit') {
                await this.editRecurringTransaction();
            }
        },
        async createRecurringTransaction() {
            this.submitting = true;
            var requestModel = {
                NotebookId: this.$store.state.notebook.selectedNotebook.id,
                Name: this.form.name,
                Description: this.form.description,
                StartDate: this.form.startDate,
                EndDate: this.form.endDate,
                Frequency: this.form.frequency,
                Interval: this.form.interval,
                Transaction: {
                    Name: this.form.transaction.name,
                    Description: this.form.transaction.description,
                    Amount: this.form.transaction.amount,
                    CurrencyId: this.form.transaction.currencyId,
                    TransactionType: this.form.transaction.transactionType,
                    TransactionDate: this.form.transaction.transactionDate,
                    Labels: this.form.transaction.labels
                }
            }

            try {
                var response = await recurringTransactionService.createRecurringTransaction(this.$store.state.notebook.selectedNotebook.id, requestModel);
                if (response.status === 200) {
                    const key = this.form.transaction.transactionType === 0
                        ? 'recurringTransactionList.transactionModal.messages.incomeCreateSuccess'
                        : 'recurringTransactionList.transactionModal.messages.expenseCreateSuccess';
                    this.$swal({ icon: 'success', title: this.$t(key) });
                    this.closeModal();
                    setTimeout(() => { window.location.reload(); }, 300);
                    return;
                }
                this.$swal({ icon: 'error', title: this.$t('recurringTransactionList.transactionModal.messages.transactionCreateError') });
            } catch (e) {
                this.$swal({ icon: 'error', title: this.$t('recurringTransactionList.transactionModal.messages.transactionCreateError') });
            } finally {
                this.submitting = false;
            }
        },
        async editRecurringTransaction() {
            this.submitting = true;
            var requestModel = {
                NotebookId: this.$store.state.notebook.selectedNotebook.id,
                Name: this.form.name,
                Description: this.form.description,
                StartDate: this.form.startDate,
                EndDate: this.form.endDate,
                Frequency: this.form.frequency,
                Interval: this.form.interval,
                Transaction: {
                    Name: this.form.transaction.name,
                    Description: this.form.transaction.description,
                    Amount: this.form.transaction.amount,
                    CurrencyId: this.form.transaction.currencyId,
                    TransactionType: this.form.transaction.transactionType,
                    TransactionDate: this.form.transaction.transactionDate,
                    Labels: this.form.transaction.labels
                }
            }

            try {
                var response = await recurringTransactionService.updateRecurringTransaction(this.$store.state.notebook.selectedNotebook.id, this.transactionData.id, requestModel);
                if (response.status === 200) {
                    const key = this.form.transaction.transactionType === 0
                        ? 'recurringTransactionList.transactionModal.messages.incomeEditSuccess'
                        : 'recurringTransactionList.transactionModal.messages.expenseEditSuccess';
                    this.$swal({ icon: 'success', title: this.$t(key) });
                    this.closeModal();
                    setTimeout(() => { window.location.reload(); }, 300);
                    return;
                }
                this.$swal({ icon: 'error', title: this.$t('recurringTransactionList.transactionModal.messages.transactionEditError') });
            } catch (e) {
                this.$swal({ icon: 'error', title: this.$t('recurringTransactionList.transactionModal.messages.transactionEditError') });
            } finally {
                this.submitting = false;
            }
        }
    },
    created() {
        var schema = yup.object({
            name: yup.string().required(this.$t('validation.required')),
            description: yup.string(),
            startDate: yup.date().required(this.$t('validation.required')),
            endDate: yup.date().required(this.$t('validation.required')),
            frequency: yup.number().required(this.$t('validation.required')),
            interval: yup.number().required(this.$t('validation.required')),
            transaction: yup.object({
                name: yup.string().required(this.$t('validation.required')),
                description: yup.string(),
                amount: yup.number().required(this.$t('validation.required')).min(0, this.$t('validation.min', { min: 0 })),
                currencyId: yup.number().required(this.$t('validation.required')).min(1, this.$t('validation.required', { min: 1 })),
                transactionType: yup.number().required(this.$t('validation.required')),
                transactionDate: yup.date().required(this.$t('validation.required')),
                labels: yup.array()
            })
        });

        this.validator = createYupValidator(schema);
    }
}
</script>

<style scoped>
.modal-content {
    border-radius: 16px;
}

.modal-header {
    border-radius: 16px 16px 0 0;
}

/* Header icon */
.rt-icon-wrap {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 16px;
    flex-shrink: 0;
}

.icon-create { background: linear-gradient(135deg, #10b981, #059669); }
.icon-edit   { background: linear-gradient(135deg, #f59e0b, #d97706); }

/* Form sections */
.form-section {
    border: 1.5px solid #e5e7eb;
    border-radius: 12px;
    overflow: visible;
}

.form-section-title {
    background: #f9fafb;
    border-bottom: 1.5px solid #e5e7eb;
    padding: 10px 16px;
    font-size: 12px;
    font-weight: 700;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-radius: 10px 10px 0 0;
}

.form-section-body {
    padding: 20px;
}

/* Field labels */
.field-label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 6px;
}

/* Inputs */
.rt-input {
    border-radius: 8px;
    border: 1.5px solid #e5e7eb;
    font-size: 14px;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.rt-input:focus {
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12);
}

.rt-input.is-invalid {
    border-color: #ef4444;
}

.rt-input-addon {
    background: #f9fafb;
    border: 1.5px solid #e5e7eb;
    border-right: none;
    border-radius: 8px 0 0 8px;
    color: #9ca3af;
    font-size: 14px;
}

.input-group .rt-input {
    border-radius: 0 8px 8px 0;
}

/* Frequency grid */
.frequency-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.freq-btn {
    padding: 6px 14px;
    border-radius: 20px;
    border: 1.5px solid #e5e7eb;
    background: #f9fafb;
    color: #6b7280;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.18s;
    white-space: nowrap;
}

.freq-btn:hover {
    border-color: #10b981;
    color: #10b981;
    background: #f0fdf4;
}

.freq-btn--active {
    border-color: #10b981;
    background: #10b981;
    color: #fff;
    font-weight: 600;
}

/* Type toggle */
.type-toggle {
    display: flex;
    gap: 0;
    border: 1.5px solid #e5e7eb;
    border-radius: 10px;
    overflow: hidden;
}

.type-btn {
    flex: 1;
    padding: 10px 0;
    border: none;
    background: #f9fafb;
    color: #6b7280;
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
}

.type-btn--income.active {
    background: #ecfdf5;
    color: #059669;
    font-weight: 700;
    box-shadow: inset 0 -2px 0 #10b981;
}

.type-btn--expense.active {
    background: #fef2f2;
    color: #dc2626;
    font-weight: 700;
    box-shadow: inset 0 -2px 0 #ef4444;
}

.type-btn:hover:not(.active) {
    background: #f3f4f6;
    color: #374151;
}

/* Label dot */
.label-dot {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
}

.save-btn {
    font-weight: 600;
}
</style>
