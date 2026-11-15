<template>
  <app-modal
    :open="open"
    :title="$t('goalList.contributeModal.title')"
    :subtitle="data?.name"
    icon="plus"
    tone="saving"
    size="sm"
    @close="$emit('close')"
  >
    <form id="goalContributeForm" class="contrib-form" novalidate @submit.prevent="save">
      <div v-if="data" class="contrib-progress">
        <div class="row contrib-progress-row">
          <span class="text-2">{{ money(data.currentAmount, code) }}</span>
          <span class="muted">/ {{ money(data.targetAmount, code) }}</span>
        </div>
        <div class="progress sm">
          <div class="progress-fill saving-fill" :style="{ width: Math.min(100, data.progressPercent || 0) + '%' }"></div>
        </div>
      </div>

      <div class="field">
        <label class="field-label" for="contrib-amount">{{ $t('goalList.contributeModal.form.amount') }}</label>
        <div class="amount-field tone-saving" :class="{ 'is-invalid': showError('amount') }">
          <input
            id="contrib-amount"
            v-model.number="form.amount"
            type="number"
            inputmode="decimal"
            step="0.01"
            min="0"
            placeholder="0,00"
            autofocus
          />
          <span class="contrib-code">{{ code }}</span>
        </div>
        <span v-if="showError('amount')" class="field-error">{{ errors.amount }}</span>
        <div v-if="data && data.remainingAmount > 0" class="quick-amounts">
          <button type="button" class="chip-btn" @click="form.amount = round(data.remainingAmount)">
            {{ $t('goalExtra.fillRemaining') }} · {{ money(data.remainingAmount, code) }}
          </button>
        </div>
      </div>

      <div class="field">
        <label class="field-label">{{ $t('goalList.contributeModal.form.contributionDate') }}</label>
        <VueDatePicker
          v-model="form.contributionDate"
          :time-config="{ enableTimePicker: false }"
          :formats="{ input: 'dd.MM.yyyy' }"
          auto-apply
          teleport
          :locale="dateLocale"
        />
      </div>
    </form>

    <template #footer>
      <button type="button" class="btn btn-secondary" @click="$emit('close')">{{ $t('common.cancel') }}</button>
      <button type="submit" form="goalContributeForm" class="btn btn-primary" :disabled="submitting">
        <span v-if="submitting" class="spinner sm"></span>
        <vue-feather v-else type="check" size="16"></vue-feather>
        {{ $t('goalList.contributeModal.confirm') }}
      </button>
    </template>
  </app-modal>
</template>

<script>
import * as yup from 'yup';
import AppModal from '@/components/ui/AppModal.vue';
import goalService from '@/services/goal.service';
import { createYupValidator } from '@/services/validator.service';
import { useDateLocale } from '@/composables/useDateLocale';
import { formatMoney } from '@/utils/format';

export default {
  name: 'GoalContributeModal',
  components: { AppModal },
  props: {
    open: { type: Boolean, default: false },
    data: { type: Object, default: null },
  },
  emits: ['close', 'saved'],
  setup() {
    const { dateLocale } = useDateLocale();
    return { dateLocale };
  },
  data() {
    return {
      form: { amount: null, contributionDate: new Date() },
      errors: {},
      submitted: false,
      submitting: false,
      validator: null,
    };
  },
  computed: {
    code() {
      return this.data?.currency?.code || '';
    },
  },
  watch: {
    open(val) {
      if (!val) return;
      this.submitted = false;
      this.errors = {};
      this.form = { amount: null, contributionDate: new Date() };
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
      amount: yup.number().typeError(req).required(req).moreThan(0, this.$t('validation.message.positive')),
      contributionDate: yup.date().nullable(),
    });
    this.validator = createYupValidator(schema);
  },
  methods: {
    money: formatMoney,
    round(v) {
      return Math.round(v * 100) / 100;
    },
    showError(field) {
      return this.submitted && !!this.errors[field];
    },
    async save() {
      if (!this.data) return;
      this.submitted = true;
      const ok = await this.validator.validateForm(this.form, this.errors);
      if (!ok) return;

      this.submitting = true;
      try {
        const response = await goalService.contributeToGoal(this.data.id, {
          GoalId: this.data.id,
          Amount: this.form.amount,
          ContributionDate: this.form.contributionDate,
        });
        if (response.status !== 200) throw new Error('contribute failed');
        this.$toast.success(this.$t('goalList.contributeModal.messages.contributeSuccess'));
        this.$emit('saved');
      } catch {
        this.$toast.error(this.$t('goalList.contributeModal.messages.contributeError'));
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>

<style scoped>
.contrib-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.contrib-progress {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
  border-radius: var(--radius);
  background: var(--surface-2);
  border: 1px solid var(--border);
}

.contrib-progress-row {
  font-size: 13px;
  font-weight: 600;
  gap: 4px;
}

.saving-fill {
  background: var(--saving);
}

.contrib-code {
  display: flex;
  align-items: center;
  padding: 0 12px;
  border-left: 1px solid var(--border);
  font-size: 13px;
  font-weight: 650;
  color: var(--text-3);
}

.quick-amounts {
  display: flex;
  gap: 6px;
}

.chip-btn {
  height: 28px;
  padding: 0 10px;
  border-radius: 20px;
  border: 1px solid var(--border-strong);
  background: var(--surface);
  color: var(--text-2);
  font-size: 12px;
  font-weight: 600;
}

.chip-btn:hover {
  border-color: var(--saving);
  color: var(--saving);
}
</style>
