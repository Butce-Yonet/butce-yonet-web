<template>
  <app-modal
    :open="open"
    :title="mode === 'edit' ? $t('goalList.modal.editTitle') : $t('goalList.modal.createTitle')"
    icon="target"
    tone="saving"
    size="md"
    @close="$emit('close')"
  >
    <form id="goalForm" class="goal-form" novalidate @submit.prevent="save">
      <div class="field">
        <label class="field-label" for="goal-name">{{ $t('goalList.modal.form.name') }}</label>
        <input
          id="goal-name"
          v-model="form.name"
          class="input"
          :class="{ 'is-invalid': showError('name') }"
          :placeholder="$t('goalExtra.namePlaceholder')"
          maxlength="200"
          autofocus
        />
        <span v-if="showError('name')" class="field-error">{{ errors.name }}</span>
      </div>

      <div class="field">
        <label class="field-label" for="goal-amount">{{ $t('goalList.modal.form.targetAmount') }}</label>
        <div class="amount-field tone-saving" :class="{ 'is-invalid': showError('targetAmount') || showError('currencyId') }">
          <input
            id="goal-amount"
            v-model.number="form.targetAmount"
            type="number"
            inputmode="decimal"
            step="0.01"
            min="0"
            placeholder="0,00"
          />
          <div class="amount-currency">
            <currency-select v-model="form.currencyId" />
          </div>
        </div>
        <span v-if="showError('targetAmount')" class="field-error">{{ errors.targetAmount }}</span>
        <span v-else-if="showError('currencyId')" class="field-error">{{ errors.currencyId }}</span>
      </div>

      <div class="form-grid">
        <div class="field">
          <label class="field-label">
            {{ $t('goalList.modal.form.deadline') }}
            <span class="optional">{{ $t('common.optional') }}</span>
          </label>
          <VueDatePicker
            v-model="form.deadline"
            :time-config="{ enableTimePicker: false }"
            :formats="{ input: 'dd.MM.yyyy' }"
            :min-date="new Date()"
            :placeholder="$t('goalList.noDeadline')"
            auto-apply
            teleport
            :locale="dateLocale"
          />
        </div>

        <div class="field">
          <label class="field-label">
            {{ $t('goalList.modal.form.labels') }}
            <span class="optional">{{ $t('common.optional') }}</span>
          </label>
          <label-select v-model="form.labels" />
        </div>
      </div>

      <p v-if="monthlyHint" class="goal-hint">
        <vue-feather type="zap" size="14"></vue-feather>
        {{ monthlyHint }}
      </p>
    </form>

    <template #footer>
      <button type="button" class="btn btn-secondary" @click="$emit('close')">{{ $t('common.cancel') }}</button>
      <button type="submit" form="goalForm" class="btn btn-primary" :disabled="submitting">
        <span v-if="submitting" class="spinner sm"></span>
        <vue-feather v-else type="check" size="16"></vue-feather>
        {{ $t('common.save') }}
      </button>
    </template>
  </app-modal>
</template>

<script>
import * as yup from 'yup';
import moment from 'moment';
import AppModal from '@/components/ui/AppModal.vue';
import CurrencySelect from '@/components/ui/CurrencySelect.vue';
import LabelSelect from '@/components/ui/LabelSelect.vue';
import goalService from '@/services/goal.service';
import { createYupValidator } from '@/services/validator.service';
import { useDateLocale } from '@/composables/useDateLocale';
import { defaultCurrencyId, formatMoney } from '@/utils/format';

function emptyForm() {
  return { name: '', targetAmount: null, currencyId: null, deadline: null, labels: [] };
}

export default {
  name: 'GoalModal',
  components: { AppModal, CurrencySelect, LabelSelect },
  props: {
    open: { type: Boolean, default: false },
    mode: { type: String, default: 'create' },
    data: { type: Object, default: null },
  },
  emits: ['close', 'saved'],
  setup() {
    const { dateLocale } = useDateLocale();
    return { dateLocale };
  },
  data() {
    return {
      form: emptyForm(),
      errors: {},
      submitted: false,
      submitting: false,
      validator: null,
    };
  },
  computed: {
    monthlyHint() {
      const { targetAmount, deadline, currencyId } = this.form;
      if (!targetAmount || !deadline || targetAmount <= 0) return '';
      const current = this.mode === 'edit' ? (this.data?.currentAmount || 0) : 0;
      const remaining = targetAmount - current;
      if (remaining <= 0) return '';
      const months = Math.max(1, Math.ceil(moment(deadline).diff(moment(), 'months', true)));
      const code = this.$store.getters['dashboard/getCurrencies'].find((c) => c.id === currencyId)?.code;
      return this.$t('goalExtra.monthlyHint', { amount: formatMoney(remaining / months, code), months });
    },
  },
  watch: {
    open(val) {
      if (val) this.reset();
    },
    form: {
      deep: true,
      handler() {
        if (this.submitted) this.validator.validateForm(this.form, this.errors);
      },
    },
  },
  created() {
    const req = this.$t('validation.message.required');
    const schema = yup.object({
      name: yup.string().trim().required(req),
      targetAmount: yup.number().typeError(req).required(req).moreThan(0, this.$t('validation.message.positive')),
      currencyId: yup.mixed().test('currency', req, (v) => v !== null && v !== '' && v !== undefined),
      deadline: yup.date().nullable(),
      labels: yup.array(),
    });
    this.validator = createYupValidator(schema);
  },
  methods: {
    reset() {
      this.submitted = false;
      this.errors = {};
      if (this.mode === 'edit' && this.data) {
        const d = this.data;
        this.form = {
          name: d.name || '',
          targetAmount: d.targetAmount,
          currencyId: d.currency?.id ?? null,
          deadline: d.deadline ? new Date(d.deadline) : null,
          labels: (d.labels || []).map((l) => l.id),
        };
      } else {
        this.form = { ...emptyForm(), currencyId: defaultCurrencyId(this.$store.getters['dashboard/getCurrencies']) };
      }
    },
    showError(field) {
      return this.submitted && !!this.errors[field];
    },
    buildRequest() {
      return {
        Name: this.form.name,
        TargetAmount: this.form.targetAmount,
        CurrencyId: this.form.currencyId,
        Deadline: this.form.deadline,
        Labels: this.form.labels,
      };
    },
    async save() {
      this.submitted = true;
      const ok = await this.validator.validateForm(this.form, this.errors);
      if (!ok) return;

      this.submitting = true;
      try {
        const response = this.mode === 'edit'
          ? await goalService.updateGoal(this.data.id, { Id: this.data.id, ...this.buildRequest() })
          : await goalService.createGoal(this.buildRequest());
        if (response.status !== 200) throw new Error('save failed');
        this.$toast.success(this.$t(`goalList.modal.messages.${this.mode === 'edit' ? 'editSuccess' : 'createSuccess'}`));
        this.$emit('saved');
      } catch {
        this.$toast.error(this.$t(`goalList.modal.messages.${this.mode === 'edit' ? 'editError' : 'createError'}`));
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>

<style scoped>
.goal-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.goal-hint {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  background: var(--saving-soft);
  color: var(--saving);
  font-size: 13px;
  font-weight: 500;
}

.goal-hint .vue-feather {
  margin-top: 2px;
}
</style>
