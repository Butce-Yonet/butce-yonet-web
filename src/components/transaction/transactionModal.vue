<template>
    <div class="modal fade modal-bookmark" id="transactionModal" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div class="modal-content border-0 shadow-lg">

                <!-- Header -->
                <div class="modal-header border-0 pb-0 px-4 pt-4">
                    <div class="d-flex align-items-center gap-3">
                        <div class="tx-icon-wrap" :class="mode === 'edit' ? 'icon-edit' : (form.transactionType === 1 ? 'icon-expense' : 'icon-income')">
                            <i :class="mode === 'edit' ? 'fa fa-pencil' : (form.transactionType === 1 ? 'fa fa-arrow-down' : 'fa fa-arrow-up')"></i>
                        </div>
                        <div>
                            <p class="text-muted mb-0 small">
                                {{ mode === 'create' ? $t('transactionList.transactionModal.createTitle') : $t('transactionList.transactionModal.editTitle') }}
                            </p>
                            <h5 class="modal-title mb-0 fw-semibold">
                                {{ getModalNotebook.name }}
                            </h5>
                        </div>
                    </div>
                    <button class="btn-close" type="button" aria-label="Close" @click="closeModal"></button>
                </div>

                <!-- Body -->
                <div class="modal-body px-4 pt-4 pb-4">
                    <form novalidate @submit.prevent="save">

                        <!-- Transaction Type Toggle -->
                        <div class="type-toggle mb-4">
                            <button
                                type="button"
                                class="type-btn"
                                :class="form.transactionType === 0 ? 'type-btn--income active' : 'type-btn--income'"
                                @click="form.transactionType = 0"
                            >
                                <i class="fa fa-arrow-up me-2"></i>
                                {{ $t('common.income') }}
                            </button>
                            <button
                                type="button"
                                class="type-btn"
                                :class="form.transactionType === 1 ? 'type-btn--expense active' : 'type-btn--expense'"
                                @click="form.transactionType = 1"
                            >
                                <i class="fa fa-arrow-down me-2"></i>
                                {{ $t('common.expense') }}
                            </button>
                        </div>

                        <div class="row g-3">
                            <!-- Name -->
                            <div class="col-sm-12 col-md-6">
                                <label class="field-label">
                                    {{ $t('transactionList.transactionModal.form.placeholder.nameLabel') }}
                                    <span class="text-danger ms-1" v-if="errors.name">*</span>
                                </label>
                                <input
                                    class="form-control tx-input"
                                    :class="{ 'is-invalid': errors.name }"
                                    v-model="form.name"
                                    :placeholder="$t('transactionList.transactionModal.form.placeholder.nameLabel')"
                                />
                            </div>

                            <!-- Description -->
                            <div class="col-sm-12 col-md-6">
                                <label class="field-label">
                                    {{ $t('transactionList.transactionModal.form.placeholder.descriptionLabel') }}
                                </label>
                                <input
                                    class="form-control tx-input"
                                    v-model="form.description"
                                    :placeholder="$t('transactionList.transactionModal.form.placeholder.descriptionLabel')"
                                />
                            </div>

                            <!-- Amount -->
                            <div class="col-sm-12 col-md-6">
                                <label class="field-label">
                                    {{ $t('transactionList.transactionModal.form.placeholder.amountLabel') }}
                                    <span class="text-danger ms-1" v-if="errors.amount">*</span>
                                </label>
                                <div class="input-group">
                                    <span class="input-group-text tx-input-addon">
                                        <i class="fa fa-money"></i>
                                    </span>
                                    <input
                                        class="form-control tx-input"
                                        :class="{ 'is-invalid': errors.amount }"
                                        type="number"
                                        v-model.number="form.amount"
                                        :placeholder="$t('transactionList.transactionModal.form.placeholder.amountLabel')"
                                    />
                                </div>
                            </div>

                            <!-- Currency -->
                            <div class="col-sm-12 col-md-6">
                                <label class="field-label">
                                    {{ $t('transactionList.transactionModal.form.placeholder.currencyLabel') }}
                                    <span class="text-danger ms-1" v-if="errors.currencyId">*</span>
                                </label>
                                <VSelect
                                    :options="currencies"
                                    label="code"
                                    :reduce="c => c.id"
                                    v-model="form.currencyId"
                                    :placeholder="$t('transactionList.transactionModal.form.placeholder.currencyLabel')"
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

                            <!-- Date -->
                            <div class="col-sm-12 col-md-6">
                                <label class="field-label">
                                    {{ $t('transactionList.transactionModal.form.placeholder.transactionDateLabel') }}
                                    <span class="text-danger ms-1" v-if="errors.transactionDate">*</span>
                                </label>
                                <VueDatePicker
                                    v-model="form.transactionDate"
                                    :time-config="{ enableTimePicker: false }"
                                    auto-apply
                                />
                            </div>

                            <!-- Labels -->
                            <div class="col-sm-12 col-md-6">
                                <label class="field-label">
                                    {{ $t('transactionList.transactionModal.form.placeholder.labelsLabel') }}
                                </label>
                                <VSelect
                                    :options="labels"
                                    label="name"
                                    :reduce="c => c.id"
                                    v-model="form.labels"
                                    multiple
                                    :placeholder="$t('transactionList.transactionModal.form.placeholder.labelsLabel')"
                                >
                                    <template #option="label">
                                        <span
                                            class="label-dot me-2"
                                            :style="{ background: label.colorCode }"
                                        ></span>
                                        {{ label.name }}
                                    </template>
                                    <template #selected-option="label">
                                        <span
                                            class="label-dot me-1"
                                            :style="{ background: label.colorCode }"
                                        ></span>
                                        {{ label.name }}
                                    </template>
                                </VSelect>
                            </div>
                        </div>

                        <!-- Footer Buttons -->
                        <div class="d-flex gap-2 justify-content-end mt-4">
                            <button class="btn btn-light px-4" type="button" @click="closeModal">
                                {{ $t('common.cancel') }}
                            </button>
                            <button
                                class="btn px-4 save-btn"
                                :class="mode === 'edit' ? 'btn-warning' : (form.transactionType === 1 ? 'btn-danger' : 'btn-success')"
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
import transactionService from '@/services/transaction.service';
import * as yup from 'yup';
import { createYupValidator } from '@/services/validator.service';
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
                amount: 0,
                currencyId: '',
                transactionType: 0,
                transactionDate: new Date(),
                labels: []
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
            labels: this.$store.getters['dashboard/getLabels']
        }
    },
    computed: {
        getModalNotebook() {
            return this.$store.state.notebook.selectedNotebook;
        }
    },
    watch: {
        modal: {
            deep: true,
            async handler(newVal) {
                this.currencies = this.$store.getters['dashboard/getCurrencies'];
                this.labels = this.$store.getters['dashboard/getLabels'];
                if (newVal._isShown) {
                    this.fillForm();
                } else {
                    this.form = {
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
        },
        form: {
            deep: true,
            async handler(newVal) {
                this.isValid = await this.validator.validateForm(this.form, this.errors);
            }
        },
    },
    methods: {
        closeModal() {
            this.modal.hide();
        },
        async save() {
            if (this.mode === 'create') {
                await this.saveTransaction();
            } else if (this.mode === 'edit') {
                await this.editTransaction();
            }
        },
        async saveTransaction() {
            this.submitting = true;
            var requestModel = {
                NotebookId: this.getModalNotebook.id,
                Transactions: []
            }

            requestModel.Transactions.push(this.form)

            try {
                var response = await transactionService.createTransaction(this.getModalNotebook.id, requestModel)

                if (response.status === 200) {
                    const key = this.form.transactionType === 0
                        ? 'transactionList.transactionModal.messages.incomeCreateSuccess'
                        : 'transactionList.transactionModal.messages.expenseCreateSuccess';
                    this.$swal({ title: this.$t(key), icon: "success" });
                    this.closeModal();

                    setTimeout(() => {
                        window.location.reload();
                    }, 300);
                } else {
                    this.$swal({
                        title: this.$t('transactionList.transactionModal.messages.transactionCreateError'),
                        icon: "error",
                    });
                }
            } catch (e) {
                this.$swal({
                    title: this.$t('transactionList.transactionModal.messages.transactionCreateError'),
                    icon: "error",
                });
            } finally {
                this.submitting = false;
            }
        },
        async editTransaction() {
            this.submitting = true;
            var requestModel = {
                NotebookId: this.getModalNotebook.id,
                TransactionId: this.transactionData.id,
                name: this.form.name,
                description: this.form.description,
                amount: this.form.amount,
                currencyId: this.form.currencyId,
                transactionType: this.form.transactionType,
                transactionDate: this.form.transactionDate,
                labels: this.form.labels
            }

            try {
                var response = await transactionService.updateTransaction(this.getModalNotebook.id, this.transactionData.id, requestModel)

                if (response.status === 200) {
                    const key = this.form.transactionType === 0
                        ? 'transactionList.transactionModal.messages.incomeEditSuccess'
                        : 'transactionList.transactionModal.messages.expenseEditSuccess';
                    this.$swal({ title: this.$t(key), icon: "success" });
                    this.closeModal();

                    setTimeout(() => {
                        window.location.reload();
                    }, 500);
                } else {
                    this.$swal({
                        title: this.$t('transactionList.transactionModal.messages.transactionEditError'),
                        icon: "error",
                    });
                }
            } catch (e) {
                this.$swal({
                    title: this.$t('transactionList.transactionModal.messages.transactionEditError'),
                    icon: "error",
                });
            } finally {
                this.submitting = false;
            }
        },
        getDefaultCurrencyId() {
            const list = this.$store.getters['dashboard/getCurrencies'];
            const byRank = list.find(c => c.rank === 1);
            if (byRank) return byRank.id;
            const byCode = list.find(c => c.code === 'TRY');
            return byCode ? byCode.id : '';
        },
        fillForm() {
            if (this.mode === 'edit' && this.transactionData) {
                this.form.name = this.transactionData.name;
                this.form.description = this.transactionData.description;
                this.form.amount = this.transactionData.amount;
                this.form.currencyId = this.transactionData.currency.id;
                this.form.transactionType = this.transactionData.transactionType;
                this.form.transactionDate = new Date(this.transactionData.transactionDate);
                this.form.labels = this.transactionData.labels.map(label => label.id);
            } else {
                this.form.currencyId = this.getDefaultCurrencyId();
            }
        }
    },
    created() {
        var schema = yup.object({
            name: yup.string().required(this.$t('validation.message.required')),
            description: yup.string(),
            amount: yup.number().required(this.$t('validation.message.required')).min(0, this.$t('validation.message.required')),
            currencyId: yup.string().required(this.$t('validation.message.required')),
            transactionType: yup.string().required(this.$t('validation.message.required')),
            transactionDate: yup.date().required(this.$t('validation.message.required')),
            labels: yup.array()
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

.tx-icon-wrap {
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

.icon-income  { background: linear-gradient(135deg, #10b981, #059669); }
.icon-expense { background: linear-gradient(135deg, #ef4444, #dc2626); }
.icon-edit    { background: linear-gradient(135deg, #f59e0b, #d97706); }

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

/* Fields */
.field-label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 6px;
}

.tx-input {
    border-radius: 8px;
    border: 1.5px solid #e5e7eb;
    font-size: 14px;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.tx-input:focus {
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12);
}

.tx-input.is-invalid {
    border-color: #ef4444;
}

.tx-input-addon {
    background: #f9fafb;
    border: 1.5px solid #e5e7eb;
    border-right: none;
    border-radius: 8px 0 0 8px;
    color: #9ca3af;
    font-size: 14px;
}

.input-group .tx-input {
    border-radius: 0 8px 8px 0;
}

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
