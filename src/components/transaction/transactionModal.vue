<template>
    <div class="modal fade modal-bookmark" id="transactionModal" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">
                        <span v-if="mode === 'create'">{{ $t('transactionList.transactionModal.createTitle') }}</span>
                        <span v-else>{{ $t('transactionList.transactionModal.editTitle') }}</span>
                    </h3>
                    <button class="btn-close" type="button" aria-label="Close" @click="closeModal"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-sm-12 col-md-6 m-t-5">
                            <label>{{ $t('transactionList.transactionModal.form.placeholder.nameLabel') }}</label>
                            <small v-if="errors.name" class="text-danger"> *</small>
                            <input class="form-control" v-model="form.name" />
                        </div>
                        <div class="col-sm-12 col-md-6 m-t-10">
                            <label>{{ $t('transactionList.transactionModal.form.placeholder.descriptionLabel')
                            }}</label>
                            <small v-if="errors.description" class="text-danger"> *</small>
                            <input class="form-control" v-model="form.description" />
                        </div>
                        <div class="col-sm-12 col-md-6 m-t-10">
                            <label>{{ $t('transactionList.transactionModal.form.placeholder.amountLabel') }}</label>
                            <small v-if="errors.amount" class="text-danger"> *</small>
                            <input class="form-control" type="number" v-model.number="form.amount" />
                        </div>
                        <div class="col-sm-12 col-md-6 m-t-10">
                            <label>{{ $t('transactionList.transactionModal.form.placeholder.currencyLabel') }}</label>
                            <small v-if="errors.currencyId" class="text-danger"> *</small>
                            <VSelect :options="currencies" label="code" :reduce="c => c.id" v-model="form.currencyId">
                                <template #option="currency">
                                    {{ currency.code }} - {{ currency.name }}
                                </template>
                                <template #selected-option="currency">
                                    {{ currency.code }} - {{ currency.name }}
                                </template>
                            </VSelect>
                        </div>
                        <div class="col-sm-12 col-md-6 m-t-10">
                            <label>{{ $t('transactionList.transactionModal.form.placeholder.transactionTypeLabel')
                            }}</label>
                            <small v-if="errors.transactionType" class="text-danger"> *</small>
                            <VSelect :options="transactionTypes" label="text" :reduce="c => c.value"
                                v-model="form.transactionType"></VSelect>
                        </div>
                        <div class="col-sm-12 col-md-6 m-t-10">
                            <label>{{ $t('transactionList.transactionModal.form.placeholder.transactionDateLabel')
                            }}</label>
                            <small v-if="errors.transactionDate" class="text-danger"> *</small>
                            <VueDatePicker v-model="form.transactionDate" :time-config="{ enableTimePicker: false }" />
                        </div>
                        <div class="col-sm-12 col-md-6 m-t-10">
                            <label>{{ $t('transactionList.transactionModal.form.placeholder.labelsLabel') }}</label>
                            <small v-if="errors.labels" class="text-danger"> *</small>
                            <VSelect :options="labels" label="name" :reduce="c => c.id" v-model="form.labels" multiple>
                            </VSelect>
                        </div>
                        <div class="col-sm-12 col-md-12 m-t-15 d-flex justify-content-end">
                            <button class="btn btn-danger float-end" @click="closeModal">{{ $t('common.cancel')
                                }}</button>
                            <button class="btn btn-success float-end m-l-5" :disabled="!isValid" @click="save">{{
                                $t('common.save') }}</button>
                        </div>
                    </div>
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
                        currencyId: '',
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
            var requestModel = {
                NotebookId: this.getModalNotebook.id,
                Transactions: []
            }

            requestModel.Transactions.push(this.form)

            try {
                var response = await transactionService.createTransaction(this.getModalNotebook.id, requestModel)

                if (response.status === 200) {
                    this.$swal({
                        title: this.$t('transactionList.transactionModal.messages.transactionCreateSuccess'),
                        icon: "success",
                    });
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
            }
        },
        async editTransaction() {
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
                    this.$swal({
                        title: this.$t('transactionList.transactionModal.messages.transactionEditSuccess'),
                        icon: "success",
                    });
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
            }
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