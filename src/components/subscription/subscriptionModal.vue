<template>
  <app-modal
    :open="open"
    :title="mode === 'edit' ? $t('subscriptionList.modal.editTitle') : $t('subscriptionList.modal.createTitle')"
    icon="file-text"
    tone="warning"
    size="lg"
    @close="$emit('close')"
  >
    <form id="subscriptionForm" class="sub-form" novalidate @submit.prevent="save">
      <div class="form-grid">
        <div class="field span-2">
          <label class="field-label" for="sub-name">{{ $t('subscriptionList.modal.form.name') }}</label>
          <input
            id="sub-name"
            v-model="form.name"
            class="input"
            :class="{ 'is-invalid': showError('name') }"
            :placeholder="$t('subscriptionExtra.namePlaceholder')"
            maxlength="200"
            autofocus
          />
          <span v-if="showError('name')" class="field-error">{{ errors.name }}</span>
        </div>

        <div class="field span-2">
          <label class="field-label">{{ $t('subscriptionList.modal.form.amount') }}</label>
          <div class="segmented sm amount-mode">
            <button type="button" :class="{ active: fixedAmount }" @click="setFixed(true)">{{ $t('subscriptionExtra.fixedAmount') }}</button>
            <button type="button" :class="{ active: !fixedAmount }" @click="setFixed(false)">{{ $t('subscriptionExtra.variableAmount') }}</button>
          </div>
          <div v-if="fixedAmount" class="amount-field" :class="{ 'is-invalid': showError('amount') || showError('currencyId') }">
            <input
              v-model.number="form.amount"
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
          <span v-else class="field-hint">{{ $t('subscriptionExtra.variableHint') }}</span>
          <span v-if="showError('amount')" class="field-error">{{ errors.amount }}</span>
          <span v-else-if="showError('currencyId')" class="field-error">{{ errors.currencyId }}</span>
        </div>

        <div class="field span-2">
          <label class="field-label">{{ $t('subscriptionList.modal.form.frequency') }}</label>
          <div class="choice-chips">
            <button
              v-for="freq in frequencies"
              :key="freq.value"
              type="button"
              :class="{ active: form.frequency === freq.value }"
              @click="form.frequency = freq.value"
            >{{ freq.text }}</button>
          </div>
        </div>

        <div v-if="showInterval" class="field">
          <label class="field-label" for="sub-interval">{{ intervalLabel }}</label>
          <input
            id="sub-interval"
            v-model.number="form.interval"
            type="number"
            min="1"
            :max="form.frequency === 7 ? 31 : undefined"
            class="input"
            :class="{ 'is-invalid': showError('interval') }"
          />
          <span v-if="showError('interval')" class="field-error">{{ errors.interval }}</span>
        </div>

        <div class="field">
          <label class="field-label">{{ $t('subscriptionList.modal.form.startDate') }}</label>
          <VueDatePicker
            v-model="form.startDate"
            :time-config="{ enableTimePicker: false }"
            :formats="{ input: 'dd.MM.yyyy' }"
            :clearable="false"
            auto-apply
            teleport
            :locale="dateLocale"
          />
          <span v-if="showError('startDate')" class="field-error">{{ errors.startDate }}</span>
        </div>

        <div class="field span-2">
          <label class="field-label">
            {{ $t('subscriptionList.modal.form.labels') }}
            <span class="optional">{{ $t('common.optional') }}</span>
          </label>
          <label-select v-model="form.labels" />
        </div>
      </div>

      <p v-if="previewText" class="sub-preview">
        <vue-feather type="info" size="14"></vue-feather>
        {{ previewText }}
      </p>
    </form>

    <template #footer>
      <button type="button" class="btn btn-secondary" @click="$emit('close')">{{ $t('common.cancel') }}</button>
      <button type="submit" form="subscriptionForm" class="btn btn-primary" :disabled="submitting">
        <span v-if="submitting" class="spinner sm"></span>
        <vue-feather v-else type="check" size="16"></vue-feather>
        {{ $t('common.save') }}
      </button>
    </template>
  </app-modal>
</template>

<script>
import * as yup from 'yup';
import AppModal from '@/components/ui/AppModal.vue';
import CurrencySelect from '@/components/ui/CurrencySelect.vue';
import LabelSelect from '@/components/ui/LabelSelect.vue';
import subscriptionService from '@/services/subscription.service';
import { createYupValidator } from '@/services/validator.service';
import { useDateLocale } from '@/composables/useDateLocale';
import { defaultCurrencyId, frequencyOptions, describeFrequency, formatDate } from '@/utils/format';

const NO_INTERVAL = [4, 5, 6];

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
  name: 'SubscriptionModal',
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
      fixedAmount: true,
      errors: {},
      submitted: false,
      submitting: false,
      validator: null,
      frequencies: frequencyOptions(this.$t),
    };
  },
  computed: {
    showInterval() {
      return !NO_INTERVAL.includes(this.form.frequency);
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
    previewText() {
      if (!this.form.startDate) return '';
      const freq = describeFrequency(this.$t, this.form.frequency, this.showInterval ? this.form.interval : null);
      return this.$t('recurringExtra.preview', { freq, start: formatDate(this.form.startDate, 'D MMMM YYYY') });
    },
  },
  watch: {
    open(val) {
      if (val) this.reset();
    },
    'form.frequency'() {
      if (!this.showInterval) this.form.interval = null;
      else if (this.form.interval == null || this.form.interval === '') this.form.interval = 1;
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
    const hasAmount = () => this.fixedAmount;
    const schema = yup.object({
      name: yup.string().trim().required(req),
      amount: yup.number().transform((v, o) => (o === '' || o === null ? null : v)).nullable()
        .test('amount', this.$t('validation.message.positive'), (v) => !hasAmount() || (v != null && v > 0)),
      currencyId: yup.mixed().test('currency', req, (v) => !hasAmount() || (v !== null && v !== '' && v !== undefined)),
      startDate: yup.date().typeError(req).required(req),
      frequency: yup.number().required(req),
      interval: yup.number().transform((v, o) => (o === '' || o === null ? null : v)).nullable().when('frequency', {
        is: (val) => !NO_INTERVAL.includes(val),
        then: (s) => s.required(req).min(1, req),
        otherwise: (s) => s.nullable(),
      }),
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
          amount: d.amount ?? null,
          currencyId: d.currency?.id ?? null,
          startDate: new Date(d.startDate),
          frequency: d.frequency,
          interval: d.interval ?? (NO_INTERVAL.includes(d.frequency) ? null : 1),
          labels: (d.labels || []).map((l) => l.id),
        };
        this.fixedAmount = d.amount != null;
      } else {
        this.form = emptyForm();
        this.form.currencyId = defaultCurrencyId(this.$store.getters['dashboard/getCurrencies']);
        this.fixedAmount = true;
      }
    },
    setFixed(val) {
      this.fixedAmount = val;
      if (val && !this.form.currencyId) {
        this.form.currencyId = defaultCurrencyId(this.$store.getters['dashboard/getCurrencies']);
      }
    },
    showError(field) {
      return this.submitted && !!this.errors[field];
    },
    buildRequest() {
      return {
        Name: this.form.name,
        Amount: this.fixedAmount ? this.form.amount : null,
        CurrencyId: this.fixedAmount ? this.form.currencyId : null,
        StartDate: this.form.startDate,
        Frequency: this.form.frequency,
        Interval: this.showInterval ? this.form.interval : null,
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
          ? await subscriptionService.updateSubscription(this.data.id, { Id: this.data.id, ...this.buildRequest() })
          : await subscriptionService.createSubscription(this.buildRequest());
        if (response.status !== 200) throw new Error('save failed');
        this.$toast.success(this.$t(`subscriptionList.modal.messages.${this.mode === 'edit' ? 'editSuccess' : 'createSuccess'}`));
        this.$emit('saved');
      } catch {
        this.$toast.error(this.$t(`subscriptionList.modal.messages.${this.mode === 'edit' ? 'editError' : 'createError'}`));
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>

<style scoped>
.sub-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.amount-mode {
  align-self: flex-start;
}

.sub-preview {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  background: var(--info-soft);
  color: var(--info);
  font-size: 13px;
  font-weight: 500;
}

.sub-preview .vue-feather {
  margin-top: 2px;
}
</style>
