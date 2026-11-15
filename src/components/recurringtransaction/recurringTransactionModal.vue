<template>
  <app-modal
    :open="open"
    :title="mode === 'edit' ? $t('recurringTransactionList.transactionModal.editTitle') : $t('recurringTransactionList.transactionModal.createTitle')"
    icon="refresh-cw"
    tone="brand"
    size="lg"
    @close="$emit('close')"
  >
    <template #head-extra>
      <ol class="stepper" :aria-label="$t('recurringExtra.steps.label')">
        <li :class="{ active: step === 1, done: step > 1 }">
          <span class="step-dot">
            <vue-feather v-if="step > 1" type="check" size="12"></vue-feather>
            <template v-else>1</template>
          </span>
          <span class="step-text">{{ $t('recurringExtra.steps.details') }}</span>
        </li>
        <li class="step-line" :class="{ done: step > 1 }" aria-hidden="true"></li>
        <li :class="{ active: step === 2 }">
          <span class="step-dot">2</span>
          <span class="step-text">{{ $t('recurringExtra.steps.preview') }}</span>
        </li>
      </ol>
    </template>

    <!-- ── Step 1: details ───────────────────────────────────── -->
    <form v-show="step === 1" id="recurringForm" class="rt-form" novalidate @submit.prevent="goPreview">
      <template v-if="mode === 'create'">
        <div class="type-toggle">
          <button type="button" class="income" :class="{ active: form.transaction.transactionType === 0 }" @click="form.transaction.transactionType = 0">
            <vue-feather type="arrow-down-left" size="16"></vue-feather>
            {{ $t('common.income') }}
          </button>
          <button type="button" class="expense" :class="{ active: form.transaction.transactionType === 1 }" @click="form.transaction.transactionType = 1">
            <vue-feather type="arrow-up-right" size="16"></vue-feather>
            {{ $t('common.expense') }}
          </button>
        </div>

        <div class="field">
          <label class="field-label" for="rt-amount">{{ $t('recurringTransactionList.transactionModal.form.placeholder.transaction.amount') }}</label>
          <div
            class="amount-field"
            :class="[{ 'is-invalid': showError('transaction.amount') || showError('transaction.currencyId') }, form.transaction.transactionType === 0 ? 'tone-income' : 'tone-expense']"
          >
            <input
              id="rt-amount"
              v-model.number="form.transaction.amount"
              type="number"
              inputmode="decimal"
              step="0.01"
              min="0"
              placeholder="0,00"
              autofocus
            />
            <div class="amount-currency">
              <currency-select v-model="form.transaction.currencyId" />
            </div>
          </div>
          <span v-if="showError('transaction.amount')" class="field-error">{{ errors['transaction.amount'] }}</span>
          <span v-else-if="showError('transaction.currencyId')" class="field-error">{{ errors['transaction.currencyId'] }}</span>
        </div>
      </template>

      <div v-else-if="data && data.transaction" class="rt-summary-box">
        <span class="tx-avatar sm" :class="tone(data.transaction.transactionType)">
          <vue-feather :type="icon(data.transaction.transactionType)" size="15"></vue-feather>
        </span>
        <div>
          <div class="amount rt-summary-amount" :class="tone(data.transaction.transactionType)">
            {{ sign(data.transaction.transactionType) }}{{ money(data.transaction.amount, data.transaction.currency?.code) }}
          </div>
          <div class="field-hint">{{ $t('recurringExtra.amountLocked') }}</div>
        </div>
      </div>

      <div class="form-grid">
        <div class="field">
          <label class="field-label" for="rt-name">{{ $t('recurringTransactionList.transactionModal.form.placeholder.name') }}</label>
          <input
            id="rt-name"
            v-model="form.name"
            class="input"
            :class="{ 'is-invalid': showError('name') }"
            :placeholder="$t('recurringExtra.namePlaceholder')"
            maxlength="200"
          />
          <span v-if="showError('name')" class="field-error">{{ errors.name }}</span>
        </div>

        <div class="field">
          <label class="field-label" for="rt-desc">
            {{ $t('recurringTransactionList.transactionModal.form.placeholder.description') }}
            <span class="optional">{{ $t('common.optional') }}</span>
          </label>
          <input id="rt-desc" v-model="form.description" class="input" maxlength="500" />
        </div>

        <div v-if="mode === 'create'" class="field span-2">
          <label class="field-label">
            {{ $t('recurringTransactionList.transactionModal.form.placeholder.transaction.labels') }}
            <span class="optional">{{ $t('common.optional') }}</span>
          </label>
          <label-select v-model="form.transaction.labels" />
        </div>
      </div>

      <div class="rt-section">
        <div class="rt-section-title">
          <vue-feather type="repeat" size="15"></vue-feather>
          {{ $t('recurringTransactionList.transactionModal.recurringInfo') }}
        </div>

        <div class="field">
          <label class="field-label">{{ $t('recurringTransactionList.transactionModal.form.placeholder.frequency') }}</label>
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

        <div class="form-grid rt-grid">
          <div class="field">
            <label class="field-label">{{ $t('recurringTransactionList.transactionModal.form.placeholder.startDate') }}</label>
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

          <div v-if="showInterval" class="field">
            <label class="field-label" for="rt-interval">{{ intervalLabel }}</label>
            <input
              id="rt-interval"
              v-model.number="form.interval"
              type="number"
              inputmode="numeric"
              min="1"
              :max="form.frequency === 7 ? 31 : undefined"
              step="1"
              class="input"
              :class="{ 'is-invalid': showError('interval') }"
            />
            <span v-if="showError('interval')" class="field-error">{{ errors.interval }}</span>
          </div>

          <div class="field">
            <label class="field-label" for="rt-count">{{ $t('recurringExtra.count') }}</label>
            <input
              id="rt-count"
              v-model.number="form.count"
              type="number"
              inputmode="numeric"
              min="1"
              :max="maxCount"
              step="1"
              class="input"
              :class="{ 'is-invalid': showError('count') }"
            />
            <span v-if="showError('count')" class="field-error">{{ errors.count }}</span>
          </div>
        </div>

        <p v-if="occurrences.length" class="rt-preview-line">
          <vue-feather type="info" size="14"></vue-feather>
          {{ summaryLine }}
        </p>
      </div>
    </form>

    <!-- ── Step 2: preview ───────────────────────────────────── -->
    <div v-if="step === 2" class="rt-review">
      <div class="review-card">
        <div class="review-head">
          <span class="tx-avatar" :class="tone(txType)">
            <vue-feather type="repeat" size="17"></vue-feather>
          </span>
          <div class="review-titles">
            <div class="review-name truncate">{{ form.name }}</div>
            <div class="review-sub">{{ frequencyText }}</div>
          </div>
          <div class="amount review-amount" :class="tone(txType)">
            {{ sign(txType) }}{{ money(txAmount, currencyCode) }}
          </div>
        </div>
        <div class="review-stats">
          <div>
            <span class="muted">{{ $t('recurringExtra.review.items') }}</span>
            <strong class="tabular">{{ occurrences.length }}</strong>
          </div>
          <div>
            <span class="muted">{{ $t('recurringExtra.review.first') }}</span>
            <strong>{{ longDate(occurrences[0]) }}</strong>
          </div>
          <div>
            <span class="muted">{{ $t('recurringExtra.review.last') }}</span>
            <strong>{{ longDate(lastOccurrence) }}</strong>
          </div>
          <div>
            <span class="muted">{{ $t('recurringExtra.review.total') }}</span>
            <strong class="tabular amount" :class="tone(txType)">{{ sign(txType) }}{{ money(txAmount * occurrences.length, currencyCode) }}</strong>
          </div>
        </div>
      </div>

      <div class="review-list-head">
        <span>{{ $t('recurringExtra.review.listTitle') }}</span>
      </div>
      <ol class="review-list">
        <li v-for="(d, i) in visibleOccurrences" :key="i" class="review-item">
          <span class="review-index tabular">{{ i + 1 }}</span>
          <span class="review-date">{{ longDate(d) }}</span>
          <span class="review-day muted">{{ weekday(d) }}</span>
          <span class="amount tabular" :class="tone(txType)">{{ sign(txType) }}{{ money(txAmount, currencyCode) }}</span>
        </li>
      </ol>
      <p v-if="hiddenCount > 0" class="review-more muted">
        {{ $t('recurringExtra.review.more', { n: hiddenCount }, hiddenCount) }}
      </p>
    </div>

    <template #footer>
      <template v-if="step === 1">
        <button type="button" class="btn btn-secondary" @click="$emit('close')">{{ $t('common.cancel') }}</button>
        <button type="submit" form="recurringForm" class="btn btn-primary">
          {{ $t('recurringExtra.steps.next') }}
          <vue-feather type="arrow-right" size="16"></vue-feather>
        </button>
      </template>
      <template v-else>
        <button type="button" class="btn btn-secondary" :disabled="submitting" @click="step = 1">
          <vue-feather type="arrow-left" size="16"></vue-feather>
          {{ $t('common.previous') }}
        </button>
        <button type="button" class="btn btn-primary" :disabled="submitting" @click="save">
          <span v-if="submitting" class="spinner sm"></span>
          <vue-feather v-else type="check" size="16"></vue-feather>
          {{ $t('recurringExtra.steps.confirm') }}
        </button>
      </template>
    </template>
  </app-modal>
</template>

<script>
import * as yup from 'yup';
import moment from 'moment';
import AppModal from '@/components/ui/AppModal.vue';
import CurrencySelect from '@/components/ui/CurrencySelect.vue';
import LabelSelect from '@/components/ui/LabelSelect.vue';
import recurringTransactionService from '@/services/recurring.transaction.service';
import { createYupValidator } from '@/services/validator.service';
import { useDateLocale } from '@/composables/useDateLocale';
import {
  defaultCurrencyId, frequencyOptions, describeFrequency, formatMoney, formatDate, txTone, txIcon, txSign,
} from '@/utils/format';
import {
  buildOccurrences, countOccurrencesUntil, usesInterval, DAY_OF_MONTH_FREQUENCY, MAX_OCCURRENCES,
} from '@/utils/recurrence';

const PREVIEW_LIMIT = 60;

export default {
  name: 'RecurringTransactionModal',
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
      step: 1,
      resetting: false,
      form: this.emptyForm(),
      errors: {},
      submitted: false,
      submitting: false,
      validator: null,
      frequencies: frequencyOptions(this.$t),
      maxCount: MAX_OCCURRENCES,
    };
  },
  computed: {
    showInterval() {
      return usesInterval(this.form.frequency);
    },
    intervalLabel() {
      switch (this.form.frequency) {
        case 0: return this.$t('subscriptionList.modal.form.intervalDaily');
        case 1: return this.$t('subscriptionList.modal.form.intervalWeekly');
        case 3: return this.$t('subscriptionList.modal.form.intervalYearly');
        case DAY_OF_MONTH_FREQUENCY: return this.$t('subscriptionList.modal.form.intervalDayOfMonth');
        default: return this.$t('subscriptionList.modal.form.intervalMonthly');
      }
    },
    occurrences() {
      return buildOccurrences({
        startDate: this.form.startDate,
        frequency: this.form.frequency,
        interval: this.showInterval ? this.form.interval : null,
        count: this.form.count,
      });
    },
    lastOccurrence() {
      return this.occurrences[this.occurrences.length - 1] || null;
    },
    visibleOccurrences() {
      return this.occurrences.slice(0, PREVIEW_LIMIT);
    },
    hiddenCount() {
      return Math.max(0, this.occurrences.length - PREVIEW_LIMIT);
    },
    frequencyText() {
      return describeFrequency(this.$t, this.form.frequency, this.showInterval ? this.form.interval : null);
    },
    summaryLine() {
      return this.$t('recurringExtra.summaryLine', {
        freq: this.frequencyText,
        n: this.occurrences.length,
        start: this.longDate(this.occurrences[0]),
        end: this.longDate(this.lastOccurrence),
      }, this.occurrences.length);
    },
    txType() {
      return this.form.transaction.transactionType;
    },
    txAmount() {
      return Number(this.form.transaction.amount) || 0;
    },
    currencyCode() {
      if (this.mode === 'edit') return this.data?.transaction?.currency?.code;
      return this.$store.getters['dashboard/getCurrencies'].find((c) => c.id === this.form.transaction.currencyId)?.code;
    },
  },
  watch: {
    open(val) {
      if (val) this.reset();
    },
    'form.frequency'(freq, old) {
      // Day-of-month and step intervals mean different things; reset to a sensible value.
      if (this.resetting || !usesInterval(freq)) return;
      if (freq === DAY_OF_MONTH_FREQUENCY && old !== DAY_OF_MONTH_FREQUENCY) {
        this.form.interval = moment(this.form.startDate || undefined).date();
      } else if (old === DAY_OF_MONTH_FREQUENCY || !usesInterval(old)) {
        this.form.interval = 1;
      }
    },
    form: {
      deep: true,
      handler() {
        if (this.submitted) this.validator.validateForm(this.form, this.errors);
      },
    },
    // Currencies load asynchronously; fill the default once they arrive.
    '$store.state.dashboard.currencies'(list) {
      if (this.open && this.mode === 'create' && !this.form.transaction.currencyId) {
        this.form.transaction.currencyId = defaultCurrencyId(list);
      }
    },
  },
  created() {
    const req = this.$t('validation.message.required');
    const positiveInt = this.$t('recurringExtra.validation.positiveInt');
    const isCreate = () => this.mode === 'create';
    const toNumber = (v, o) => (o === '' || o === null ? null : v);
    const schema = yup.object({
      name: yup.string().trim().required(req),
      description: yup.string().nullable(),
      startDate: yup.date().typeError(req).required(req),
      frequency: yup.number().required(req),
      interval: yup.number().transform(toNumber).nullable().typeError(positiveInt)
        .test('interval', positiveInt, function (v) {
          if (!usesInterval(this.parent.frequency)) return true;
          return v != null && Number.isInteger(v) && v > 0;
        })
        .test('day', this.$t('recurringExtra.validation.dayOfMonth'), function (v) {
          if (this.parent.frequency !== DAY_OF_MONTH_FREQUENCY || v == null) return true;
          return v >= 1 && v <= 31;
        }),
      count: yup.number().transform(toNumber).nullable().typeError(positiveInt)
        .test('count', positiveInt, (v) => v != null && Number.isInteger(v) && v > 0)
        .max(MAX_OCCURRENCES, this.$t('recurringExtra.validation.maxCount', { max: MAX_OCCURRENCES })),
      transaction: yup.object({
        amount: yup.number().nullable().test('amount', this.$t('validation.message.positive'), (v) => !isCreate() || (v != null && v > 0)),
        currencyId: yup.mixed().test('currency', req, (v) => !isCreate() || (v !== null && v !== '' && v !== undefined)),
        labels: yup.array(),
      }),
    });
    this.validator = createYupValidator(schema);
  },
  methods: {
    money: formatMoney,
    tone: txTone,
    icon: txIcon,
    sign: txSign,
    longDate(d) {
      return d ? formatDate(d, 'D MMMM YYYY') : '—';
    },
    weekday(d) {
      return moment(d).locale(this.$i18n.locale).format('dddd');
    },
    emptyForm() {
      return {
        name: '',
        description: '',
        startDate: new Date(),
        frequency: 2,
        interval: 1,
        count: 12,
        transaction: {
          amount: null,
          currencyId: defaultCurrencyId(this.$store.getters['dashboard/getCurrencies']),
          transactionType: 1,
          labels: [],
        },
      };
    },
    reset() {
      // Prevents the frequency watcher from overwriting the loaded interval.
      this.resetting = true;
      this.$nextTick(() => { this.resetting = false; });
      this.step = 1;
      this.submitted = false;
      this.errors = {};
      if (this.mode === 'edit' && this.data) {
        const d = this.data;
        const interval = usesInterval(d.frequency) ? (d.interval > 0 ? d.interval : 1) : null;
        const startDate = new Date(d.startDate);
        this.form = {
          name: d.name || '',
          description: d.description || '',
          startDate,
          frequency: d.frequency,
          interval,
          count: countOccurrencesUntil({ startDate, frequency: d.frequency, interval, endDate: d.endDate }) || 12,
          transaction: {
            amount: d.transaction?.amount ?? null,
            currencyId: d.transaction?.currency?.id ?? null,
            transactionType: d.transaction?.transactionType ?? 1,
            labels: (d.transaction?.labels || []).map((l) => l.id),
            name: d.transaction?.name,
            description: d.transaction?.description,
            transactionDate: d.transaction?.transactionDate,
          },
        };
      } else {
        this.form = this.emptyForm();
      }
    },
    showError(field) {
      return this.submitted && !!this.errors[field];
    },
    async goPreview() {
      this.submitted = true;
      const ok = await this.validator.validateForm(this.form, this.errors);
      if (!ok || !this.occurrences.length) return;
      this.step = 2;
    },
    buildRequest() {
      const f = this.form;
      const t = f.transaction;
      const edit = this.mode === 'edit';
      return {
        Name: f.name,
        Description: f.description,
        StartDate: f.startDate,
        // End date is derived from the schedule: end of the day of the last item.
        EndDate: moment(this.lastOccurrence).endOf('day').toDate(),
        Frequency: f.frequency,
        Interval: this.showInterval ? f.interval : null,
        Transaction: {
          Name: edit ? (t.name || f.name) : f.name,
          Description: edit ? (t.description ?? f.description) : f.description,
          Amount: t.amount,
          CurrencyId: t.currencyId,
          TransactionType: t.transactionType,
          TransactionDate: edit && t.transactionDate ? t.transactionDate : f.startDate,
          Labels: t.labels,
        },
      };
    },
    async save() {
      if (!this.lastOccurrence) return;
      this.submitting = true;
      const isIncome = this.form.transaction.transactionType === 0;
      try {
        const response = this.mode === 'edit'
          ? await recurringTransactionService.updateRecurringTransaction(this.data.id, { Id: this.data.id, ...this.buildRequest() })
          : await recurringTransactionService.createRecurringTransaction(this.buildRequest());
        if (response.status !== 200) throw new Error('save failed');

        const key = this.mode === 'edit'
          ? (isIncome ? 'incomeEditSuccess' : 'expenseEditSuccess')
          : (isIncome ? 'incomeCreateSuccess' : 'expenseCreateSuccess');
        this.$toast.success(this.$t(`recurringTransactionList.transactionModal.messages.${key}`));
        this.$emit('saved');
      } catch {
        const key = this.mode === 'edit' ? 'transactionEditError' : 'transactionCreateError';
        this.$toast.error(this.$t(`recurringTransactionList.transactionModal.messages.${key}`));
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>

<style scoped>
/* Stepper */
.stepper {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 8px;
}

.stepper li {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-3);
}

.step-dot {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11.5px;
  font-weight: 700;
  border: 1.5px solid var(--border-strong);
  background: var(--surface);
}

.stepper li.active {
  color: var(--text);
}

.stepper li.active .step-dot {
  border-color: var(--primary);
  background: var(--primary);
  color: #fff;
}

.stepper li.done .step-dot {
  border-color: var(--primary);
  background: var(--primary-soft);
  color: var(--primary);
}

.step-line {
  width: 24px;
  height: 2px;
  border-radius: 2px;
  background: var(--border-strong);
}

.step-line.done {
  background: var(--primary);
}

@media (max-width: 640px) {
  .step-text {
    display: none;
  }

  .step-line {
    width: 12px;
  }
}

/* Step 1 */
.rt-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.rt-summary-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: var(--radius);
  background: var(--surface-2);
  border: 1px solid var(--border);
}

.rt-summary-amount {
  font-size: 16px;
}

.rt-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--surface-2);
}

.rt-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 650;
  color: var(--text-2);
}

.rt-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

@media (max-width: 600px) {
  .rt-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

.rt-preview-line {
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

.rt-preview-line .vue-feather {
  margin-top: 2px;
}

/* Step 2 */
.rt-review {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.review-card {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

.review-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
}

.review-titles {
  flex: 1;
  min-width: 0;
}

.review-name {
  font-size: 15px;
  font-weight: 650;
}

.review-sub {
  font-size: 12.5px;
  color: var(--text-3);
}

.review-amount {
  font-size: 16px;
}

.review-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-top: 1px solid var(--border);
  background: var(--surface-2);
}

.review-stats > div {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 16px;
  font-size: 12px;
  min-width: 0;
}

.review-stats > div + div {
  border-left: 1px solid var(--border);
}

.review-stats strong {
  font-size: 13.5px;
  font-weight: 650;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 600px) {
  .review-stats {
    grid-template-columns: 1fr 1fr;
  }

  .review-stats > div:nth-child(3) {
    border-left: 0;
  }

  .review-stats > div:nth-child(n + 3) {
    border-top: 1px solid var(--border);
  }
}

.review-list-head {
  font-size: 12px;
  font-weight: 650;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.review-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: var(--radius);
}

.review-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--border);
  font-size: 13.5px;
}

.review-item:last-child {
  border-bottom: 0;
}

.review-index {
  width: 26px;
  height: 22px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: var(--surface-3);
  color: var(--text-2);
  font-size: 11.5px;
  font-weight: 700;
}

.review-date {
  font-weight: 600;
}

.review-day {
  flex: 1;
  font-size: 12.5px;
  text-transform: capitalize;
}

.review-more {
  font-size: 12.5px;
  text-align: center;
}
</style>
