<template>
    <div class="modal fade" id="goalModal" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div class="modal-content border-0 shadow-lg">

                <div class="modal-header border-0 pb-0 px-4 pt-4">
                    <div class="d-flex align-items-center gap-3">
                        <div class="goal-icon-wrap" :class="mode === 'edit' ? 'icon-edit' : 'icon-create'">
                            <i :class="mode === 'edit' ? 'fa fa-pencil' : 'fa fa-bullseye'"></i>
                        </div>
                        <div>
                            <h5 class="modal-title mb-0 fw-semibold">
                                {{ mode === 'create'
                                    ? $t('goalList.modal.createTitle')
                                    : $t('goalList.modal.editTitle') }}
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
                                    {{ $t('goalList.modal.form.name') }}
                                    <span class="text-danger ms-1" v-if="errors.name">*</span>
                                </label>
                                <input
                                    class="form-control goal-input"
                                    :class="{ 'is-invalid': errors.name }"
                                    v-model="form.name"
                                    :placeholder="$t('goalList.modal.form.name')"
                                />
                            </div>

                            <!-- Deadline -->
                            <div class="col-sm-12 col-md-6">
                                <label class="field-label">
                                    {{ $t('goalList.modal.form.deadline') }}
                                    <span class="field-optional">{{ $t('goalList.modal.form.deadlineOptionalHint') }}</span>
                                </label>
                                <VueDatePicker
                                    v-model="form.deadline"
                                    :time-config="{ enableTimePicker: false }"
                                    auto-apply
                                    teleport
                                    :clearable="true"
                                    :locale="dateLocale"
                                />
                            </div>

                            <!-- Target amount -->
                            <div class="col-sm-12 col-md-6">
                                <label class="field-label">
                                    {{ $t('goalList.modal.form.targetAmount') }}
                                    <span class="text-danger ms-1" v-if="errors.targetAmount">*</span>
                                </label>
                                <div class="input-group">
                                    <span class="input-group-text goal-input-addon">
                                        <i class="fa fa-money"></i>
                                    </span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        class="form-control goal-input"
                                        :class="{ 'is-invalid': errors.targetAmount }"
                                        v-model="form.targetAmount"
                                    />
                                </div>
                            </div>

                            <!-- Currency -->
                            <div class="col-sm-12 col-md-6">
                                <label class="field-label">
                                    {{ $t('goalList.modal.form.currency') }}
                                    <span class="text-danger ms-1" v-if="errors.currencyId">*</span>
                                </label>
                                <VSelect
                                    :options="currencies"
                                    v-model="form.currencyId"
                                    label="code"
                                    :reduce="c => c.id"
                                    :placeholder="$t('goalList.modal.form.currency')"
                                >
                                    <template #option="c">
                                        <span class="fw-semibold">{{ c.code }}</span>
                                        <span class="text-muted ms-1 small">{{ c.name }}</span>
                                    </template>
                                    <template #selected-option="c">{{ c.code }} - {{ c.name }}</template>
                                </VSelect>
                            </div>

                            <!-- Labels -->
                            <div class="col-12">
                                <label class="field-label">
                                    {{ $t('goalList.modal.form.labels') }}
                                </label>
                                <VSelect
                                    :options="labels"
                                    v-model="form.labels"
                                    label="name"
                                    :reduce="l => l.id"
                                    multiple
                                    :placeholder="$t('goalList.modal.form.labels')"
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
import goalService from '@/services/goal.service';
import { useDateLocale } from '@/composables/useDateLocale';

function emptyForm() {
    return {
        name: '',
        targetAmount: null,
        currencyId: null,
        deadline: null,
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
        goalData: {
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
        };
    },
    watch: {
        modal: {
            deep: true,
            async handler(newVal) {
                this.currencies = this.$store.getters['dashboard/getCurrencies'];
                this.labels = this.$store.getters['dashboard/getLabels'];
                if (newVal._isShown) {
                    if (this.mode === 'edit' && this.goalData) {
                        this.form = {
                            name: this.goalData.name,
                            targetAmount: this.goalData.targetAmount,
                            currencyId: this.goalData.currency?.id ?? null,
                            deadline: this.goalData.deadline ? new Date(this.goalData.deadline) : null,
                            labels: (this.goalData.labels || []).map(l => l.id),
                        };
                    } else if (this.mode === 'create') {
                        this.form = { ...emptyForm(), currencyId: this.getDefaultCurrencyId() };
                    }
                } else {
                    this.form = emptyForm();
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
        buildRequestModel() {
            return {
                Name: this.form.name,
                TargetAmount: this.form.targetAmount,
                CurrencyId: this.form.currencyId,
                Deadline: this.form.deadline,
                Labels: this.form.labels,
            };
        },
        async save() {
            if (this.mode === 'create') {
                await this.createGoal();
            } else {
                await this.editGoal();
            }
        },
        async createGoal() {
            this.submitting = true;
            try {
                const response = await goalService.createGoal(this.buildRequestModel());
                if (response.status === 200) {
                    this.$swal({ icon: 'success', title: this.$t('goalList.modal.messages.createSuccess') });
                    this.closeModal();
                    this.$emit('saved');
                    return;
                }
                this.$swal({ icon: 'error', title: this.$t('goalList.modal.messages.createError') });
            } catch (e) {
                this.$swal({ icon: 'error', title: this.$t('goalList.modal.messages.createError') });
            } finally {
                this.submitting = false;
            }
        },
        async editGoal() {
            this.submitting = true;
            try {
                const requestModel = { Id: this.goalData.id, ...this.buildRequestModel() };
                const response = await goalService.updateGoal(this.goalData.id, requestModel);
                if (response.status === 200) {
                    this.$swal({ icon: 'success', title: this.$t('goalList.modal.messages.editSuccess') });
                    this.closeModal();
                    this.$emit('saved');
                    return;
                }
                this.$swal({ icon: 'error', title: this.$t('goalList.modal.messages.editError') });
            } catch (e) {
                this.$swal({ icon: 'error', title: this.$t('goalList.modal.messages.editError') });
            } finally {
                this.submitting = false;
            }
        }
    },
    created() {
        const schema = yup.object({
            name: yup.string().required(this.$t('validation.message.required')),
            targetAmount: yup.number().typeError(this.$t('validation.message.required')).required(this.$t('validation.message.required')).moreThan(0, this.$t('validation.message.required')),
            currencyId: yup.number().typeError(this.$t('validation.message.required')).required(this.$t('validation.message.required')),
            deadline: yup.date().nullable(),
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

.goal-icon-wrap {
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

.icon-create { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
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

.goal-input {
    border-radius: 8px;
    border: 1.5px solid #e5e7eb;
    font-size: 14px;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.goal-input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.goal-input.is-invalid {
    border-color: #ef4444;
}

.goal-input-addon {
    background: #f9fafb;
    border: 1.5px solid #e5e7eb;
    border-right: none;
    border-radius: 8px 0 0 8px;
    color: #9ca3af;
    font-size: 14px;
}

.input-group .goal-input {
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
