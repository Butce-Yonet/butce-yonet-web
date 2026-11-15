<template>
  <app-modal
    :open="open"
    :title="isEdit ? $t('budgets.modal.editTitle') : $t('budgets.modal.createTitle')"
    icon="sliders"
    tone="warning"
    size="md"
    @close="$emit('close')"
  >
    <form id="budgetForm" class="budget-form" novalidate @submit.prevent="save">
      <div class="form-grid">
        <div class="field">
          <label class="field-label">{{ $t('budgets.modal.scope') }}</label>
          <VSelect
            v-if="!isEdit"
            append-to-body
            :calculate-position="position"
            v-model="form.scope"
            :options="scopeOptions"
            label="name"
            :reduce="(o) => o.key"
            :selectable="(o) => !o.taken"
            :clearable="false"
            :class="{ 'is-invalid': showError('scope') }"
            :placeholder="$t('budgets.modal.scopePlaceholder')"
          >
            <template #option="o">
              <span class="label-dot" :style="{ background: o.colorCode || 'var(--primary)' }"></span>
              {{ o.name }}
              <span v-if="o.taken" class="taken">· {{ $t('budgets.modal.taken') }}</span>
            </template>
            <template #selected-option="o">
              <span class="label-dot" :style="{ background: o.colorCode || 'var(--primary)' }"></span>
              {{ o.name }}
            </template>
            <template #no-options>{{ $t('common.noResults') }}</template>
          </VSelect>
          <div v-else class="input readonly">
            <span class="label-dot" :style="{ background: data?.label?.colorCode || 'var(--primary)' }"></span>
            {{ data?.isGeneral ? $t('budgets.general') : data?.label?.name }}
          </div>
          <span v-if="showError('scope')" class="field-error">{{ errors.scope }}</span>
          <span v-else-if="isGeneralSelected" class="field-hint">{{ $t('budgets.limitations.labeledOnly') }}</span>
        </div>

        <div class="field">
          <label class="field-label">{{ $t('budgets.modal.currency') }}</label>
          <currency-select v-if="!isEdit" v-model="form.currencyId" show-name />
          <div v-else class="input readonly">
            <strong>{{ data?.currency?.code }}</strong>
            <span class="muted">{{ data?.currency?.name }}</span>
          </div>
          <span v-if="showError('currencyId')" class="field-error">{{ errors.currencyId }}</span>
          <span v-else class="field-hint">{{ $t('budgets.limitations.noConversion') }}</span>
        </div>
      </div>

      <p v-if="isEdit" class="readonly-note">
        <vue-feather type="info" size="14"></vue-feather>
        {{ $t('budgets.modal.readonlyNote') }}
      </p>

      <div class="field">
        <label class="field-label" for="budget-amount">{{ $t('budgets.modal.amount') }}</label>
        <div class="amount-field tone-expense" :class="{ 'is-invalid': showError('amount') }">
          <input
            id="budget-amount"
            v-model.number="form.amount"
            type="number"
            inputmode="decimal"
            step="0.01"
            min="0"
            placeholder="0,00"
          />
          <div v-if="currency" class="amount-currency static">{{ currency.symbol || currency.code }}</div>
        </div>
        <span v-if="showError('amount')" class="field-error">{{ errors.amount }}</span>
      </div>

      <div class="field">
        <label class="field-label" for="budget-start-day">{{ $t('budgets.modal.periodStartDay') }}</label>
        <select id="budget-start-day" v-model.number="form.periodStartDay" class="select">
          <option v-for="d in days" :key="d" :value="d">{{ $t('budgets.modal.dayOption', { n: d }) }}</option>
        </select>
        <span class="field-hint">{{ $t('budgets.modal.periodHelp') }}</span>
      </div>

      <p class="period-preview">
        <vue-feather type="calendar" size="14"></vue-feather>
        {{ $t('budgets.modal.periodPreview', { range: previewText }) }}
      </p>

      <p v-if="formError" class="form-error">
        <vue-feather type="alert-circle" size="14"></vue-feather>
        {{ formError }}
      </p>
    </form>

    <template #footer>
      <button type="button" class="btn btn-secondary" @click="$emit('close')">{{ $t('common.cancel') }}</button>
      <button type="submit" form="budgetForm" class="btn btn-primary" :disabled="submitting">
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
import budgetService from '@/services/budget.service';
import { createYupValidator } from '@/services/validator.service';
import { floatingDropdown } from '@/utils/selectPosition';
import { defaultCurrencyId } from '@/utils/format';
import { PERIOD_START_DAYS, budgetComboKey, previewPeriod } from '@/utils/budget';

const GENERAL = 'general';

function emptyForm() {
  return { scope: null, currencyId: null, amount: null, periodStartDay: 1 };
}

export default {
  name: 'BudgetModal',
  components: { AppModal, CurrencySelect },
  props: {
    open: { type: Boolean, default: false },
    mode: { type: String, default: 'create' },
    // Edit: the BudgetDto. Create: optional { labelId, currencyId } preset.
    data: { type: Object, default: null },
  },
  emits: ['close', 'saved'],
  data() {
    return {
      form: emptyForm(),
      errors: {},
      formError: '',
      submitted: false,
      submitting: false,
      validator: null,
      existing: [],
      days: PERIOD_START_DAYS,
      position: floatingDropdown(260),
    };
  },
  computed: {
    isEdit() {
      return this.mode === 'edit';
    },
    takenKeys() {
      return new Set(this.existing.map((b) => budgetComboKey(b.label?.id ?? null, b.currency?.id)));
    },
    scopeOptions() {
      const cur = this.form.currencyId;
      const isTaken = (labelId) => cur != null && this.takenKeys.has(budgetComboKey(labelId, cur));
      const labels = this.$store.getters['dashboard/getLabels'].map((l) => ({
        key: l.id, name: l.name, colorCode: l.colorCode, taken: isTaken(l.id),
      }));
      return [{ key: GENERAL, name: this.$t('budgets.general'), colorCode: null, taken: isTaken(null) }, ...labels];
    },
    isGeneralSelected() {
      return this.isEdit ? !!this.data?.isGeneral : this.form.scope === GENERAL;
    },
    currency() {
      if (this.isEdit) return this.data?.currency || null;
      return this.$store.getters['dashboard/getCurrencies'].find((c) => c.id === this.form.currencyId) || null;
    },
    previewText() {
      const { start, end } = previewPeriod(this.form.periodStartDay || 1);
      const locale = this.$i18n.locale;
      return `${moment(start).locale(locale).format('D MMM')} – ${moment(end).locale(locale).format('D MMM YYYY')}`;
    },
  },
  watch: {
    open(val) {
      if (val) this.reset();
    },
    form: {
      deep: true,
      handler() {
        this.formError = '';
        if (this.submitted) this.validator.validateForm(this.form, this.errors);
      },
    },
    // Switching currency can make the chosen scope a duplicate; clear it then.
    'form.currencyId'() {
      const opt = this.scopeOptions.find((o) => o.key === this.form.scope);
      if (opt?.taken) this.form.scope = null;
    },
  },
  created() {
    const req = this.$t('validation.message.required');
    const schema = yup.object({
      scope: yup.mixed().test('scope', req, (v) => this.isEdit || (v !== null && v !== undefined && v !== '')),
      currencyId: yup.mixed().test('currency', req, (v) => this.isEdit || (v !== null && v !== undefined && v !== '')),
      amount: yup.number().typeError(req).required(req)
        .moreThan(0, this.$t('validation.message.positive'))
        .test('decimals', this.$t('budgets.modal.maxDecimals'), (v) => v == null || /^\d+(\.\d{1,2})?$/.test(String(v))),
      periodStartDay: yup.number().integer().min(1).max(28).required(req),
    });
    this.validator = createYupValidator(schema);
  },
  methods: {
    reset() {
      this.submitted = false;
      this.errors = {};
      this.formError = '';
      if (this.isEdit && this.data) {
        this.form = {
          scope: this.data.isGeneral ? GENERAL : this.data.label?.id,
          currencyId: this.data.currency?.id ?? null,
          amount: this.data.amount,
          periodStartDay: this.data.periodStartDay || 1,
        };
        return;
      }
      const preset = this.data || {};
      this.form = {
        ...emptyForm(),
        currencyId: preset.currencyId ?? defaultCurrencyId(this.$store.getters['dashboard/getCurrencies']),
      };
      this.existing = [];
      this.loadExisting(preset);
    },
    async loadExisting(preset) {
      try {
        this.existing = (await budgetService.list()) || [];
      } catch {
        this.existing = [];
      }
      if (preset.labelId !== undefined && this.form.scope == null) {
        const key = preset.labelId === null ? GENERAL : preset.labelId;
        if (!this.scopeOptions.find((o) => o.key === key)?.taken) this.form.scope = key;
      }
    },
    showError(field) {
      return this.submitted && !!this.errors[field];
    },
    errorMessage(err) {
      switch (err?.kind) {
        case 'alreadyExists': return this.$t('budgets.errors.alreadyExists');
        case 'notFound': return this.isEdit ? this.$t('budgets.errors.notFound') : this.$t('budgets.errors.optionNotFound');
        case 'validation': return this.$t('budgets.errors.validation');
        case 'network': return this.$t('budgets.errors.network');
        default: return this.$t('budgets.errors.generic');
      }
    },
    async save() {
      this.submitted = true;
      const ok = await this.validator.validateForm(this.form, this.errors);
      if (!ok) return;

      this.submitting = true;
      try {
        if (this.isEdit) {
          await budgetService.update(this.data.id, {
            amount: this.form.amount,
            periodStartDay: this.form.periodStartDay,
          });
        } else {
          await budgetService.create({
            userLabelId: this.form.scope === GENERAL ? null : this.form.scope,
            amount: this.form.amount,
            currencyId: this.form.currencyId,
            periodStartDay: this.form.periodStartDay,
          });
        }
        this.$toast.success(this.$t(this.isEdit ? 'budgets.messages.editSuccess' : 'budgets.messages.createSuccess'));
        this.$emit('saved');
      } catch (err) {
        this.formError = this.errorMessage(err);
        if (err?.kind === 'alreadyExists') this.loadExisting({});
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>

<style scoped>
.budget-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.readonly {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--surface-2);
  color: var(--text-2);
  cursor: not-allowed;
}

.readonly:hover {
  border-color: var(--border-strong);
}

.taken {
  color: var(--text-3);
  font-size: 12px;
  margin-left: 4px;
}

.amount-currency.static {
  width: auto;
  min-width: 52px;
  justify-content: center;
  display: flex;
  align-items: center;
  padding: 0 14px;
  font-weight: 650;
  color: var(--text-2);
}

.readonly-note,
.period-preview,
.form-error {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
}

.readonly-note {
  background: var(--surface-2);
  color: var(--text-2);
  margin-top: -6px;
}

.period-preview {
  background: var(--warning-soft);
  color: var(--warning);
}

.form-error {
  background: var(--danger-soft);
  color: var(--danger);
}

.readonly-note .vue-feather,
.period-preview .vue-feather,
.form-error .vue-feather {
  margin-top: 2px;
  flex-shrink: 0;
}
</style>
