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
                        <div class="col-sm-12 col-md-6">
                            <input class="form-control" v-model="form.name"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import currencyService from '@/services/currency.service';
import notebookLabelService from '@/services/notebook.label.service';
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
                transactionType: '',
                transactionDate: new Date(),
                labels: []
            },
            validator: null,
            errors: {},
            isValid : false,
            submitting: false,
            currencies: []
        }
    },
    computed: {
        getModalNotebook() {
            return this.$store.state.notebook.selectedNotebook;
        }
    },
    watch: {
        modal:{
            deep: true,
            async handler(newVal) {
                if (newVal._isShown) {
                  await this.getNotebookLabels();
                }else{
                    this.form = {
                        name: '',
                        description: '',
                        amount: 0,
                        currencyId: '',
                        transactionType: '',
                        transactionDate: new Date(),
                        labels: []
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
        form:{
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
                var response = await notebookLabelService.getNotebookLabels(this.getModalNotebook.id);
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
        }
    },
    created() {
        this.getCurrencies();

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