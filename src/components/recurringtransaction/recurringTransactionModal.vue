<template>
    <div class="modal fade modal-bookmark" id="recurringTransactionModal" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">
                        <span v-if="mode === 'create'">{{ $t('recurringTransactionList.transactionModal.createTitle')
                            }}</span>
                        <span v-else>{{ $t('recurringTransactionList.transactionModal.editTitle') }}</span>
                    </h3>
                    <button class="btn-close" type="button" aria-label="Close" @click="closeModal"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-sm-12 col-md-12">
                            <div class="card border">
                                <div class="card-header">
                                    {{ $t('recurringTransactionList.transactionModal.recurringInfo') }}
                                </div>
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-sm-12 col-md-6 m-t-10">
                                            <label>{{
                                                $t('recurringTransactionList.transactionModal.form.placeholder.name')
                                                }}</label>
                                            <small v-if="errors.name" class="text-danger">*</small>
                                            <input class="form-control" v-model="form.name" />
                                        </div>
                                        <div class="col-sm-12 col-md-6 m-t-10">
                                            <label>{{
                                                $t('recurringTransactionList.transactionModal.form.placeholder.description')
                                                }}</label>
                                            <input class="form-control" v-model="form.description" />
                                        </div>
                                        <div class="col-sm-12 col-md-6 m-t-10">
                                            <label>{{
                                                $t('recurringTransactionList.transactionModal.form.placeholder.startDate')
                                            }}</label>
                                            <small v-if="errors.startDate" class="text-danger">*</small>
                                            <VueDatePicker v-model="form.startDate"
                                                :time-config="{ enableTimePicker: false }" />
                                        </div>
                                        <div class="col-sm-12 col-md-6 m-t-10">
                                            <label>{{
                                                $t('recurringTransactionList.transactionModal.form.placeholder.endDate')
                                            }}</label>
                                            <small v-if="errors.endDate" class="text-danger">*</small>
                                            <VueDatePicker v-model="form.endDate"
                                                :time-config="{ enableTimePicker: false }" />
                                        </div>
                                        <div class="col-sm-12 col-md-6 m-t-10">
                                            <label>{{
                                                $t('recurringTransactionList.transactionModal.form.placeholder.frequency')
                                            }}</label>
                                            <small v-if="errors.frequency" class="text-danger">*</small>
                                            <VSelect :options="frequencies" v-model="form.frequency" label="text"
                                                :reduce="c => c.value"></VSelect>
                                        </div>
                                        <div class="col-sm-12 col-md-6 m-t-10">
                                            <label>{{
                                                $t('recurringTransactionList.transactionModal.form.placeholder.interval')
                                            }}</label>
                                            <small v-if="errors.interval" class="text-danger">*</small>
                                            <input type="number" class="form-control" v-model="form.interval" min="0" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-sm-12 col-md-12">
                        <div class="card border">
                            <div class="card-header">
                                {{ $t('recurringTransactionList.transactionModal.transactionInfo') }}
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-sm-12 col-md-6 m-t-10">
                                        <label>{{
                                            $t('recurringTransactionList.transactionModal.form.placeholder.transaction.name')
                                            }}</label>
                                        <small v-if="errors.transaction?.name" class="text-danger">*</small>
                                        <input class="form-control" v-model="form.transaction.name" />
                                    </div>
                                    <div class="col-sm-12 col-md-6 m-t-10">
                                        <label>{{
                                            $t('recurringTransactionList.transactionModal.form.placeholder.transaction.description')
                                            }}</label>
                                        <input class="form-control" v-model="form.transaction.description" />
                                    </div>
                                    <div class="col-sm-12 col-md-6 m-t-10">
                                        <label>{{
                                            $t('recurringTransactionList.transactionModal.form.placeholder.transaction.amount')
                                            }}</label>
                                        <small v-if="errors.transaction?.amount" class="text-danger">*</small>
                                        <input type="number" class="form-control" v-model="form.transaction.amount" />
                                    </div>
                                    <div class="col-sm-12 col-md-6 m-t-10">
                                        <label>{{
                                            $t('recurringTransactionList.transactionModal.form.placeholder.transaction.currency')
                                            }}</label>
                                        <small v-if="errors.transaction?.currencyId" class="text-danger">*</small>
                                        <VSelect :options="currencies" v-model="form.transaction.currencyId"
                                            label="code" :reduce="c => c.id">
                                            <template #option="currency">
                                                {{ currency.code }} - {{ currency.name }}
                                            </template>
                                            <template #selected-option="currency">
                                                {{ currency.code }} - {{ currency.name }}
                                            </template>
                                        </VSelect>
                                    </div>
                                    <div class="col-sm-12 col-md-6 m-t-10">
                                        <label>{{
                                            $t('recurringTransactionList.transactionModal.form.placeholder.transaction.transactionType')
                                            }}</label>
                                        <small v-if="errors.transaction?.transactionType" class="text-danger">*</small>
                                        <VSelect :options="transactionTypes" v-model="form.transaction.transactionType"
                                            label="text" :reduce="c => c.value">
                                        </VSelect>
                                    </div>
                                    <div class="col-sm-12 col-md-6 m-t-10">
                                        <label>{{
                                            $t('recurringTransactionList.transactionModal.form.placeholder.transaction.labels')
                                            }}</label>
                                        <VSelect :options="labels" v-model="form.transaction.labels" label="name"
                                            :reduce="c => c.id" multiple></VSelect>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-sm-12 col-md-12 d-flex justify-content-end">
                        <button class="btn btn-danger float-end" @click="closeModal">
                            {{ $t('common.cancel') }}
                        </button>
                        <button class="btn btn-success float-end m-l-5" @click="save" :disabled="!isValid">
                            {{ $t('common.save') }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import * as yup from 'yup';
import { createYupValidator } from '@/services/validator.service';
import currencyService from '@/services/currency.service';
import notebookLabelService from '@/services/notebook.label.service';
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
                interval: null,
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
            currencies: [],
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
            labels: []
        }
    },
    watch: {
        modal: {
            deep: true,
            async handler(newVal) {
                if (newVal._isShown) {
                    await this.getNotebookLabels();
                } else {
                    this.form = {
                        name: '',
                        description: '',
                        startDate: new Date(),
                        endDate: new Date(),
                        frequency: 0,
                        interval: null,
                        transaction: {
                            name: '',
                            description: '',
                            amount: 0,
                            currencyId: '',
                            transactionType: 0,
                            transactionDate: new Date(),
                            labels: []
                        }
                    }
                }
            }
        },
        '$store.state.notebook.selectedNotebook': {
            deep: true,
            async handler(newVal) {
                await this.getNotebookLabels();
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
        closeModal() {
            this.modal.hide();
        },
        async getCurrencies() {
            try {
                var response = await currencyService.getCurrencies();
                this.currencies = response.data;
            } catch (e) {
                this.$swal({
                    icon: 'error',
                    title: this.$t('transactionList.transactionModal.messages.currenciesLoadError'),
                });
            }
        },
        async getNotebookLabels() {
            try {
                var response = await notebookLabelService.getNotebookLabels(this.$store.state.notebook.selectedNotebook.id);
                if (response.status === 200) {
                    this.labels = response.data.data;
                } else {
                    this.$swal({
                        icon: 'error',
                        title: this.$t('editNotebookDetail.messages.notebookLabelsLoadError'),
                    });
                }
            } catch (e) {
                this.$swal({
                    icon: 'error',
                    title: this.$t('editNotebookDetail.messages.notebookLabelsLoadError'),
                });
            }
        },
        async save() {
            if (this.mode === 'create') {
                await this.createRecurringTransaction();
            } else if (this.mode === 'edit') {
                await this.editRecurringTransaction();
            }
        },
        async createRecurringTransaction() {
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
                    this.$swal({
                        icon: 'success',
                        title: this.$t('recurringTransactionList.transactionModal.messages.transactionCreateSuccess'),
                    });
                    this.closeModal();
                    setTimeout(() => {
                        window.location.reload();
                    }, 300);
                    return;
                }

                this.$swal({
                    icon: 'error',
                    title: this.$t('recurringTransactionList.transactionModal.messages.transactionCreateError'),
                });
            } catch (e) {
                this.$swal({
                    icon: 'error',
                    title: this.$t('recurringTransactionList.transactionModal.messages.transactionCreateError'),
                });
            }

        },
        async editRecurringTransaction() {

        }
    },
    created() {
        this.getCurrencies();

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