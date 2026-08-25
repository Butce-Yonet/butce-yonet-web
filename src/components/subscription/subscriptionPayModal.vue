<template>
    <div class="modal fade" id="subscriptionPayModal" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content border-0 shadow-lg">

                <div class="modal-header border-0 pb-0 px-4 pt-4">
                    <div class="d-flex align-items-center gap-3">
                        <div class="pay-icon-wrap">
                            <i class="fa fa-check"></i>
                        </div>
                        <div>
                            <p class="text-muted mb-0 small">{{ subscription?.name }}</p>
                            <h5 class="modal-title mb-0 fw-semibold">
                                {{ $t('subscriptionList.payModal.title') }}
                            </h5>
                        </div>
                    </div>
                    <button class="btn-close" type="button" aria-label="Close" @click="closeModal"></button>
                </div>

                <div class="modal-body px-4 pt-4 pb-4">
                    <form novalidate @submit.prevent="save">
                        <div class="row g-3">

                            <!-- Amount -->
                            <div class="col-sm-12 col-md-7">
                                <label class="field-label">
                                    {{ $t('subscriptionList.payModal.form.amount') }}
                                    <span class="text-danger ms-1" v-if="errors.amount">*</span>
                                </label>
                                <div class="input-group">
                                    <span class="input-group-text pay-input-addon">
                                        <i class="fa fa-money"></i>
                                    </span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        class="form-control pay-input"
                                        :class="{ 'is-invalid': errors.amount }"
                                        v-model="form.amount"
                                    />
                                </div>
                            </div>

                            <!-- Currency -->
                            <div class="col-sm-12 col-md-5">
                                <label class="field-label">
                                    {{ $t('subscriptionList.payModal.form.currency') }}
                                    <span class="text-danger ms-1" v-if="errors.currencyId">*</span>
                                </label>
                                <VSelect
                                    :options="currencies"
                                    v-model="form.currencyId"
                                    label="code"
                                    :reduce="c => c.id"
                                    :placeholder="$t('subscriptionList.payModal.form.currency')"
                                >
                                    <template #option="c">
                                        <span class="fw-semibold">{{ c.code }}</span>
                                        <span class="text-muted ms-1 small">{{ c.name }}</span>
                                    </template>
                                    <template #selected-option="c">{{ c.code }}</template>
                                </VSelect>
                            </div>

                            <!-- Paid date -->
                            <div class="col-12">
                                <label class="field-label">
                                    {{ $t('subscriptionList.payModal.form.paidDate') }}
                                </label>
                                <VueDatePicker
                                    v-model="form.paidDate"
                                    :time-config="{ enableTimePicker: false }"
                                    auto-apply
                                    teleport
                                    :locale="dateLocale"
                                />
                            </div>

                        </div>

                        <div class="d-flex gap-2 justify-content-end mt-4">
                            <button type="button" class="btn btn-light px-4" @click="closeModal">
                                {{ $t('common.cancel') }}
                            </button>
                            <button type="submit" class="btn btn-success px-4" :disabled="!isValid || submitting">
                                <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                                <i v-else class="fa fa-check me-2"></i>
                                {{ $t('subscriptionList.payModal.confirm') }}
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
import subscriptionService from '@/services/subscription.service';
import { useDateLocale } from '@/composables/useDateLocale';

export default {
    setup() {
        const { dateLocale } = useDateLocale();
        return { dateLocale };
    },
    props: {
        modal: {
            type: Object,
            required: true
        },
        subscription: {
            type: Object,
            required: false,
            default: null
        }
    },
    emits: ['saved'],
    data() {
        return {
            form: {
                amount: null,
                currencyId: null,
                paidDate: new Date()
            },
            validator: null,
            errors: {},
            isValid: false,
            submitting: false,
            currencies: this.$store.getters['dashboard/getCurrencies'],
        };
    },
    watch: {
        modal: {
            deep: true,
            async handler(newVal) {
                this.currencies = this.$store.getters['dashboard/getCurrencies'];
                if (newVal._isShown && this.subscription) {
                    this.form = {
                        amount: this.subscription.amount ?? null,
                        currencyId: this.subscription.currency?.id ?? this.getDefaultCurrencyId(),
                        paidDate: new Date()
                    };
                }
            }
        },
        form: {
            deep: true,
            async handler() {
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
            return byCode ? byCode.id : null;
        },
        closeModal() {
            this.modal.hide();
        },
        async save() {
            if (!this.subscription) return;
            this.submitting = true;
            const requestModel = {
                SubscriptionId: this.subscription.id,
                Amount: this.form.amount,
                CurrencyId: this.form.currencyId,
                PaidDate: this.form.paidDate,
            };

            try {
                const response = await subscriptionService.markSubscriptionAsPaid(this.subscription.id, requestModel);
                if (response.status === 200) {
                    this.$swal({ icon: 'success', title: this.$t('subscriptionList.payModal.messages.paySuccess') });
                    this.closeModal();
                    this.$emit('saved');
                    return;
                }
                this.$swal({ icon: 'error', title: this.$t('subscriptionList.payModal.messages.payError') });
            } catch (e) {
                this.$swal({ icon: 'error', title: this.$t('subscriptionList.payModal.messages.payError') });
            } finally {
                this.submitting = false;
            }
        }
    },
    created() {
        const schema = yup.object({
            amount: yup.number().typeError(this.$t('validation.message.required')).required(this.$t('validation.message.required')).min(0.01, this.$t('validation.message.required')),
            currencyId: yup.number().typeError(this.$t('validation.message.required')).required(this.$t('validation.message.required')),
            paidDate: yup.date().nullable(),
        });
        this.validator = createYupValidator(schema);
    }
}
</script>

<style scoped>
.modal-content {
    border-radius: 16px;
}

.pay-icon-wrap {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 16px;
    flex-shrink: 0;
    background: linear-gradient(135deg, #10b981, #059669);
}

.field-label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 6px;
}

.pay-input {
    border-radius: 8px;
    border: 1.5px solid #e5e7eb;
    font-size: 14px;
}

.pay-input.is-invalid {
    border-color: #ef4444;
}

.pay-input-addon {
    background: #f9fafb;
    border: 1.5px solid #e5e7eb;
    border-right: none;
    border-radius: 8px 0 0 8px;
    color: #9ca3af;
    font-size: 14px;
}

.input-group .pay-input {
    border-radius: 0 8px 8px 0;
}
</style>
