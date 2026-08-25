<template>
    <div class="modal fade" id="goalContributeModal" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content border-0 shadow-lg">

                <div class="modal-header border-0 pb-0 px-4 pt-4">
                    <div class="d-flex align-items-center gap-3">
                        <div class="contribute-icon-wrap">
                            <i class="fa fa-plus"></i>
                        </div>
                        <div>
                            <p class="text-muted mb-0 small">{{ goal?.name }}</p>
                            <h5 class="modal-title mb-0 fw-semibold">
                                {{ $t('goalList.contributeModal.title') }}
                            </h5>
                        </div>
                    </div>
                    <button class="btn-close" type="button" aria-label="Close" @click="closeModal"></button>
                </div>

                <div class="modal-body px-4 pt-4 pb-4">
                    <form novalidate @submit.prevent="save">
                        <div class="row g-3">

                            <!-- Amount -->
                            <div class="col-12">
                                <label class="field-label">
                                    {{ $t('goalList.contributeModal.form.amount') }}
                                    <span class="text-danger ms-1" v-if="errors.amount">*</span>
                                </label>
                                <div class="input-group">
                                    <span class="input-group-text contribute-input-addon">
                                        <i class="fa fa-money"></i>
                                    </span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        class="form-control contribute-input"
                                        :class="{ 'is-invalid': errors.amount }"
                                        v-model="form.amount"
                                    />
                                    <span class="input-group-text contribute-input-currency">{{ goal?.currency?.code }}</span>
                                </div>
                            </div>

                            <!-- Contribution date -->
                            <div class="col-12">
                                <label class="field-label">
                                    {{ $t('goalList.contributeModal.form.contributionDate') }}
                                </label>
                                <VueDatePicker
                                    v-model="form.contributionDate"
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
                            <button type="submit" class="btn btn-primary px-4" :disabled="!isValid || submitting">
                                <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                                <i v-else class="fa fa-check me-2"></i>
                                {{ $t('goalList.contributeModal.confirm') }}
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
        goal: {
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
                contributionDate: new Date(),
            },
            validator: null,
            errors: {},
            isValid: false,
            submitting: false,
        };
    },
    watch: {
        modal: {
            deep: true,
            handler(newVal) {
                if (newVal._isShown) {
                    this.form = { amount: null, contributionDate: new Date() };
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
        closeModal() {
            this.modal.hide();
        },
        async save() {
            if (!this.goal) return;
            this.submitting = true;
            const requestModel = {
                GoalId: this.goal.id,
                Amount: this.form.amount,
                ContributionDate: this.form.contributionDate,
            };

            try {
                const response = await goalService.contributeToGoal(this.goal.id, requestModel);
                if (response.status === 200) {
                    this.$swal({ icon: 'success', title: this.$t('goalList.contributeModal.messages.contributeSuccess') });
                    this.closeModal();
                    this.$emit('saved');
                    return;
                }
                this.$swal({ icon: 'error', title: this.$t('goalList.contributeModal.messages.contributeError') });
            } catch (e) {
                this.$swal({ icon: 'error', title: this.$t('goalList.contributeModal.messages.contributeError') });
            } finally {
                this.submitting = false;
            }
        }
    },
    created() {
        const schema = yup.object({
            amount: yup.number().typeError(this.$t('validation.message.required')).required(this.$t('validation.message.required')).moreThan(0, this.$t('validation.message.required')),
            contributionDate: yup.date().nullable(),
        });
        this.validator = createYupValidator(schema);
    }
}
</script>

<style scoped>
.modal-content {
    border-radius: 16px;
}

.contribute-icon-wrap {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 16px;
    flex-shrink: 0;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
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

.contribute-input {
    border-radius: 0;
    border: 1.5px solid #e5e7eb;
    font-size: 14px;
}

.contribute-input.is-invalid {
    border-color: #ef4444;
}

.contribute-input-addon {
    background: #f9fafb;
    border: 1.5px solid #e5e7eb;
    border-right: none;
    border-radius: 8px 0 0 8px;
    color: #9ca3af;
    font-size: 14px;
}

.contribute-input-currency {
    background: #f9fafb;
    border: 1.5px solid #e5e7eb;
    border-left: none;
    border-radius: 0 8px 8px 0;
    color: #374151;
    font-size: 13px;
    font-weight: 700;
}
</style>
