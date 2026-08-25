<template>
    <div class="modal fade" id="subscriptionModal" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div class="modal-content border-0 shadow-lg">

                <div class="modal-header border-0 pb-0 px-4 pt-4">
                    <div class="d-flex align-items-center gap-3">
                        <div class="sub-icon-wrap" :class="mode === 'edit' ? 'icon-edit' : 'icon-create'">
                            <i :class="mode === 'edit' ? 'fa fa-pencil' : 'fa fa-refresh'"></i>
                        </div>
                        <div>
                            <h5 class="modal-title mb-0 fw-semibold">
                                {{ mode === 'create'
                                    ? $t('subscriptionList.modal.createTitle')
                                    : $t('subscriptionList.modal.editTitle') }}
                            </h5>
                        </div>
                    </div>
                    <button class="btn-close" type="button" aria-label="Close" @click="closeModal"></button>
                </div>

                <div class="modal-body px-4 pt-3 pb-4">
                    <form novalidate @submit.prevent="save">
                        <div class="row g-3">

                            <!-- Name -->
                            <div class="col-sm-12 col-md-6">
                                <label class="field-label">
                                    {{ $t('subscriptionList.modal.form.name') }}
                                    <span class="text-danger ms-1" v-if="errors.name">*</span>
                                </label>
                                <input
                                    class="form-control sub-input"
                                    :class="{ 'is-invalid': errors.name }"
                                    v-model="form.name"
                                    :placeholder="$t('subscriptionList.modal.form.name')"
                                />
                            </div>

                            <!-- Start date -->
                            <div class="col-sm-12 col-md-6">
                                <label class="field-label">
                                    {{ $t('subscriptionList.modal.form.startDate') }}
                                    <span class="text-danger ms-1" v-if="errors.startDate">*</span>
                                </label>
                                <VueDatePicker
                                    v-model="form.startDate"
                                    :time-config="{ enableTimePicker: false }"
                                    auto-apply
                                    teleport
                                    :locale="dateLocale"
                                />
                            </div>

                            <!-- Amount -->
                            <div class="col-sm-12 col-md-6">
                                <label class="field-label">
                                    {{ $t('subscriptionList.modal.form.amount') }}
                                    <span class="field-optional">{{ $t('subscriptionList.modal.form.amountOptionalHint') }}</span>
                                </label>
                                <div class="input-group">
                                    <span class="input-group-text sub-input-addon">
                                        <i class="fa fa-money"></i>
                                    </span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        class="form-control sub-input"
                                        :class="{ 'is-invalid': errors.amount }"
                                        v-model="form.amount"
                                        :placeholder="$t('subscriptionList.modal.form.amountPlaceholder')"
                                    />
                                </div>
                            </div>

                            <!-- Currency -->
                            <div class="col-sm-12 col-md-6">
                                <label class="field-label">
                                    {{ $t('subscriptionList.modal.form.currency') }}
                                    <span class="text-danger ms-1" v-if="errors.currencyId">*</span>
                                </label>
                                <VSelect
                                    :options="currencies"
                                    v-model="form.currencyId"
                                    label="code"
                                    :reduce="c => c.id"
                                    :clearable="true"
                                    :disabled="!hasAmount"
                                    :placeholder="$t('subscriptionList.modal.form.currency')"
                                >
                                    <template #option="c">
                                        <span class="fw-semibold">{{ c.code }}</span>
                                        <span class="text-muted ms-1 small">{{ c.name }}</span>
                                    </template>
                                    <template #selected-option="c">{{ c.code }} - {{ c.name }}</template>
                                </VSelect>
                            </div>

                            <!-- Frequency -->
                            <div class="col-12">
                                <label class="field-label">
                                    {{ $t('subscriptionList.modal.form.frequency') }}
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
                            <div class="col-sm-12 col-md-4" v-if="showInterval">
                                <label class="field-label">
                                    {{ intervalLabel }}
                                    <span class="text-danger ms-1" v-if="errors.interval">*</span>
                                </label>
                                <div class="input-group">
                                    <span class="input-group-text sub-input-addon">
                                        <i class="fa fa-refresh"></i>
                                    </span>
                                    <input
                                        type="number"
                                        class="form-control sub-input"
                                        :class="{ 'is-invalid': errors.interval }"
                                        v-model="form.interval"
                                        min="1"
                                        :max="form.frequency === 7 ? 31 : undefined"
                                    />
                                </div>
                            </div>

                            <!-- Labels -->
                            <div class="col-12">
                                <label class="field-label">
                                    {{ $t('subscriptionList.modal.form.labels') }}
                                </label>
                                <VSelect
                                    :options="labels"
                                    v-model="form.labels"
                                    label="name"
                                    :reduce="l => l.id"
                                    multiple
                                    :placeholder="$t('subscriptionList.modal.form.labels')"
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

                        <div class="d-flex gap-2 justify-content-end mt-4">
                            <button type="button" class="btn btn-light px-4" @click="closeModal">
                                {{ $t('common.cancel') }}
                            </button>
                            <button
                                type="submit"
                                class="btn px-4 save-btn"
                                :class="mode === 'edit' ? 'btn-warning' : 'btn-success'"
                                :disabled="!isValid || submitting"
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
import subscriptionService from '@/services/subscription.service';
import { useDateLocale } from '@/composables/useDateLocale';

const NO_INTERVAL_FREQUENCIES = [4, 5, 6];

function emptyForm() {
    return {
        name: '',
        amount: null,
        currencyId: null,
        startDate: new Date(),
        frequency: 2,
        interval: 1,
        labels: [],
    };
}

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
        mode: {
            type: String,
            required: true
        },
        subscriptionData: {
            type: Object,
            required: false,
            default: null
        }
    },
    emits: ['saved'],
    data() {
        return {
            form: emptyForm(),
            validator: null,
            errors: {},
            isValid: false,
            submitting: false,
            currencies: this.$store.getters['dashboard/getCurrencies'],
            labels: this.$store.getters['dashboard/getLabels'],
            frequencies: [
                { value: 0, text: this.$t('common.frequency.daily') },
                { value: 1, text: this.$t('common.frequency.weekly') },
                { value: 2, text: this.$t('common.frequency.monthly') },
                { value: 3, text: this.$t('common.frequency.yearly') },
                { value: 4, text: this.$t('common.frequency.lastDayOfTheMonth') },
                { value: 5, text: this.$t('common.frequency.firstBusinessDayOfTheMonth') },
                { value: 6, text: this.$t('common.frequency.lastBusinessDayOfTheMonth') },
                { value: 7, text: this.$t('common.frequency.xTHOfTheMonth') },
            ],
        };
    },
    computed: {
        hasAmount() {
            return this.form.amount !== null && this.form.amount !== '' && this.form.amount !== undefined;
        },
        showInterval() {
            return !NO_INTERVAL_FREQUENCIES.includes(this.form.frequency);
        },
        intervalLabel() {
            switch (this.form.frequency) {
                case 0: return this.$t('subscriptionList.modal.form.intervalDaily');
                case 1: return this.$t('subscriptionList.modal.form.intervalWeekly');
                case 3: return this.$t('subscriptionList.modal.form.intervalYearly');
                case 7: return this.$t('subscriptionList.modal.form.intervalDayOfMonth');
                default: return this.$t('subscriptionList.modal.form.intervalMonthly');
            }
        },
    },
    watch: {
        modal: {
            deep: true,
            async handler(newVal) {
                this.currencies = this.$store.getters['dashboard/getCurrencies'];
                this.labels = this.$store.getters['dashboard/getLabels'];
                if (newVal._isShown) {
                    if (this.mode === 'edit' && this.subscriptionData) {
                        this.form = {
                            name: this.subscriptionData.name,
                            amount: this.subscriptionData.amount ?? null,
                            currencyId: this.subscriptionData.currency?.id ?? null,
                            startDate: new Date(this.subscriptionData.startDate),
                            frequency: this.subscriptionData.frequency,
                            interval: this.subscriptionData.interval ?? 1,
                            labels: (this.subscriptionData.labels || []).map(l => l.id),
                        };
                    } else if (this.mode === 'create') {
                        this.form = emptyForm();
                    }
                } else {
                    this.form = emptyForm();
                }
            }
        },
        'form.amount'(newVal) {
            if (newVal === null || newVal === '' || newVal === undefined) {
                this.form.currencyId = null;
            } else if (!this.form.currencyId) {
                this.form.currencyId = this.getDefaultCurrencyId();
            }
        },
        'form.frequency'() {
            if (!this.showInterval) {
                this.form.interval = null;
            } else if (this.form.interval === null) {
                this.form.interval = 1;
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
        buildRequestModel() {
            return {
                Name: this.form.name,
                Amount: this.hasAmount ? this.form.amount : null,
                CurrencyId: this.hasAmount ? this.form.currencyId : null,
                StartDate: this.form.startDate,
                Frequency: this.form.frequency,
                Interval: this.showInterval ? this.form.interval : null,
                Labels: this.form.labels,
            };
        },
        async save() {
            if (this.mode === 'create') {
                await this.createSubscription();
            } else {
                await this.editSubscription();
            }
        },
        async createSubscription() {
            this.submitting = true;
            try {
                const response = await subscriptionService.createSubscription(this.buildRequestModel());
                if (response.status === 200) {
                    this.$swal({ icon: 'success', title: this.$t('subscriptionList.modal.messages.createSuccess') });
                    this.closeModal();
                    this.$emit('saved');
                    return;
                }
                this.$swal({ icon: 'error', title: this.$t('subscriptionList.modal.messages.createError') });
            } catch (e) {
                this.$swal({ icon: 'error', title: this.$t('subscriptionList.modal.messages.createError') });
            } finally {
                this.submitting = false;
            }
        },
        async editSubscription() {
            this.submitting = true;
            try {
                const requestModel = { Id: this.subscriptionData.id, ...this.buildRequestModel() };
                const response = await subscriptionService.updateSubscription(this.subscriptionData.id, requestModel);
                if (response.status === 200) {
                    this.$swal({ icon: 'success', title: this.$t('subscriptionList.modal.messages.editSuccess') });
                    this.closeModal();
                    this.$emit('saved');
                    return;
                }
                this.$swal({ icon: 'error', title: this.$t('subscriptionList.modal.messages.editError') });
            } catch (e) {
                this.$swal({ icon: 'error', title: this.$t('subscriptionList.modal.messages.editError') });
            } finally {
                this.submitting = false;
            }
        }
    },
    created() {
        const schema = yup.object({
            name: yup.string().required(this.$t('validation.message.required')),
            amount: yup.number().transform((v, o) => (o === '' || o === null ? null : v)).nullable().min(0, this.$t('validation.message.required')),
            currencyId: yup.number().nullable().when('amount', {
                is: (val) => val !== null && val !== undefined && val !== '',
                then: (s) => s.required(this.$t('validation.message.required')),
                otherwise: (s) => s.nullable(),
            }),
            startDate: yup.date().required(this.$t('validation.message.required')),
            frequency: yup.number().required(this.$t('validation.message.required')),
            interval: yup.number().transform((v, o) => (o === '' || o === null ? null : v)).nullable().when('frequency', {
                is: (val) => !NO_INTERVAL_FREQUENCIES.includes(val),
                then: (s) => s.required(this.$t('validation.message.required')).min(1, this.$t('validation.message.required')),
                otherwise: (s) => s.nullable(),
            }),
            labels: yup.array(),
        });
        this.validator = createYupValidator(schema);
    }
}
</script>

<style scoped>
.modal-content {
    border-radius: 16px;
}

.sub-icon-wrap {
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

.field-label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 6px;
}

.field-optional {
    text-transform: none;
    font-weight: 500;
    color: #9ca3af;
    letter-spacing: normal;
    font-size: 11px;
}

.sub-input {
    border-radius: 8px;
    border: 1.5px solid #e5e7eb;
    font-size: 14px;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.sub-input:focus {
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12);
}

.sub-input.is-invalid {
    border-color: #ef4444;
}

.sub-input-addon {
    background: #f9fafb;
    border: 1.5px solid #e5e7eb;
    border-right: none;
    border-radius: 8px 0 0 8px;
    color: #9ca3af;
    font-size: 14px;
}

.input-group .sub-input {
    border-radius: 0 8px 8px 0;
}

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
