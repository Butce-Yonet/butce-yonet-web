<template>
  <app-modal
    :open="open"
    :title="mode === 'edit' ? $t('transactionList.transactionModal.editTitle') : $t('transactionList.transactionModal.createTitle')"
    :icon="form.transactionType === 0 ? 'arrow-down-left' : 'arrow-up-right'"
    :tone="form.transactionType === 0 ? 'income' : 'expense'"
    size="md"
    @close="$emit('close')"
  >
    <form id="transactionForm" class="tx-form" novalidate @submit.prevent="save()">
      <div class="type-toggle">
        <button
          type="button"
          class="income"
          :class="{ active: form.transactionType === 0 }"
          @click="form.transactionType = 0"
        >
          <vue-feather type="arrow-down-left" size="16"></vue-feather>
          {{ $t('common.income') }}
        </button>
        <button
          type="button"
          class="expense"
          :class="{ active: form.transactionType === 1 }"
          @click="form.transactionType = 1"
        >
          <vue-feather type="arrow-up-right" size="16"></vue-feather>
          {{ $t('common.expense') }}
        </button>
      </div>

      <div class="field">
        <label class="field-label" for="tx-amount">
          {{ $t('transactionList.transactionModal.form.placeholder.amountLabel') }}
        </label>
        <div
          class="amount-field"
          :class="[{ 'is-invalid': showError('amount') || showError('currencyId') }, form.transactionType === 0 ? 'tone-income' : 'tone-expense']"
        >
          <input
            id="tx-amount"
            ref="amount"
            v-model.number="form.amount"
            type="number"
            inputmode="decimal"
            step="0.01"
            min="0"
            placeholder="0,00"
            autocomplete="off"
            autofocus
          />
          <div class="amount-currency">
            <currency-select v-model="form.currencyId" />
          </div>
        </div>
        <span v-if="showError('amount')" class="field-error">{{ errors.amount }}</span>
        <span v-else-if="showError('currencyId')" class="field-error">{{ errors.currencyId }}</span>
      </div>

      <div class="form-grid">
        <div class="field">
          <label class="field-label" for="tx-name">{{ $t('transactionList.transactionModal.form.placeholder.nameLabel') }}</label>
          <input
            id="tx-name"
            v-model="form.name"
            class="input"
            :class="{ 'is-invalid': showError('name') }"
            :placeholder="$t('transactionModalExtra.namePlaceholder')"
            autocomplete="off"
            maxlength="200"
          />
          <span v-if="showError('name')" class="field-error">{{ errors.name }}</span>
        </div>

        <div class="field">
          <label class="field-label">{{ $t('transactionList.transactionModal.form.placeholder.transactionDateLabel') }}</label>
          <VueDatePicker
            v-model="form.transactionDate"
            :time-config="{ enableTimePicker: false }"
            :formats="{ input: 'dd.MM.yyyy' }"
            :clearable="false"
            auto-apply
            teleport
            :locale="dateLocale"
          />
          <div class="date-shortcuts">
            <button type="button" class="link-btn" @click="setDate(0)">{{ $t('common.today') }}</button>
            <button type="button" class="link-btn" @click="setDate(1)">{{ $t('common.yesterday') }}</button>
          </div>
        </div>

        <div class="field span-2">
          <label class="field-label">
            {{ $t('transactionList.transactionModal.form.placeholder.labelsLabel') }}
            <span class="optional">{{ $t('common.optional') }}</span>
          </label>
          <label-select v-model="form.labels" />
        </div>

        <div class="field span-2">
          <label class="field-label" for="tx-desc">
            {{ $t('transactionList.transactionModal.form.placeholder.descriptionLabel') }}
            <span class="optional">{{ $t('common.optional') }}</span>
          </label>
          <input
            id="tx-desc"
            v-model="form.description"
            class="input"
            :placeholder="$t('transactionModalExtra.descriptionPlaceholder')"
            autocomplete="off"
            maxlength="500"
          />
        </div>
      </div>
    </form>

    <template #footer>
      <button v-if="mode === 'edit'" type="button" class="btn btn-danger-ghost" :disabled="submitting" @click="remove">
        <vue-feather type="trash-2" size="15"></vue-feather>
        <span class="hide-mobile">{{ $t('common.delete') }}</span>
      </button>
      <span class="spacer"></span>
      <button
        v-if="mode === 'create'"
        type="button"
        class="btn btn-secondary hide-mobile"
        :disabled="submitting"
        @click="save({ addAnother: true })"
      >
        {{ $t('transactionModalExtra.saveAndNew') }}
      </button>
      <button type="submit" form="transactionForm" class="btn btn-primary" :disabled="submitting">
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
import transactionService from '@/services/transaction.service';
import { createYupValidator } from '@/services/validator.service';
import { useDateLocale } from '@/composables/useDateLocale';
import { defaultCurrencyId } from '@/utils/format';
import { confirmDelete } from '@/utils/confirm';

export default {
  name: 'TransactionModal',
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
      form: this.emptyForm(),
      errors: {},
      submitted: false,
      submitting: false,
      validator: null,
    };
  },
  watch: {
    open(val) {
      if (val) this.reset();
    },
    // Currencies load asynchronously; fill the default once they arrive.
    '$store.state.dashboard.currencies'(list) {
      if (this.open && !this.form.currencyId) this.form.currencyId = defaultCurrencyId(list);
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
      description: yup.string().nullable(),
      amount: yup.number().typeError(req).required(req).moreThan(0, this.$t('validation.message.positive')),
      currencyId: yup.mixed().test('required', req, (v) => v !== null && v !== '' && v !== undefined),
      transactionType: yup.number().required(req),
      transactionDate: yup.date().typeError(req).required(req),
      labels: yup.array(),
    });
    this.validator = createYupValidator(schema);
  },
  methods: {
    emptyForm(keep = {}) {
      return {
        name: '',
        description: '',
        amount: null,
        currencyId: keep.currencyId ?? defaultCurrencyId(this.$store.getters['dashboard/getCurrencies']),
        transactionType: keep.transactionType ?? 1,
        transactionDate: keep.transactionDate ?? new Date(),
        labels: [],
      };
    },
    reset() {
      this.submitted = false;
      this.errors = {};
      if (this.mode === 'edit' && this.data) {
        const d = this.data;
        this.form = {
          name: d.name || '',
          description: d.description || '',
          amount: d.amount,
          currencyId: d.currency?.id ?? null,
          transactionType: d.transactionType,
          transactionDate: new Date(d.transactionDate),
          labels: (d.labels || []).map((l) => l.id),
        };
      } else {
        this.form = this.emptyForm({
          transactionType: this.data?.transactionType,
          transactionDate: this.data?.transactionDate ? new Date(this.data.transactionDate) : undefined,
        });
      }
    },
    showError(field) {
      return this.submitted && !!this.errors[field];
    },
    setDate(daysAgo) {
      this.form.transactionDate = moment().subtract(daysAgo, 'days').toDate();
    },
    async save({ addAnother = false } = {}) {
      this.submitted = true;
      const ok = await this.validator.validateForm(this.form, this.errors);
      if (!ok) return;

      this.submitting = true;
      const isIncome = this.form.transactionType === 0;
      try {
        let response;
        if (this.mode === 'edit') {
          response = await transactionService.updateTransaction({
            transactionId: this.data.id,
            name: this.form.name,
            description: this.form.description,
            amount: this.form.amount,
            currencyId: this.form.currencyId,
            transactionType: this.form.transactionType,
            transactionDate: this.form.transactionDate,
            labels: this.form.labels,
          });
        } else {
          response = await transactionService.createTransaction({ Transactions: [{ ...this.form }] });
        }

        if (response.status !== 200) throw new Error('save failed');

        const key = this.mode === 'edit'
          ? (isIncome ? 'incomeEditSuccess' : 'expenseEditSuccess')
          : (isIncome ? 'incomeCreateSuccess' : 'expenseCreateSuccess');
        this.$toast.success(this.$t(`transactionList.transactionModal.messages.${key}`));

        if (addAnother) {
          this.$emit('saved', { keepOpen: true });
          this.form = this.emptyForm({
            currencyId: this.form.currencyId,
            transactionType: this.form.transactionType,
            transactionDate: this.form.transactionDate,
          });
          this.submitted = false;
          this.errors = {};
          this.$nextTick(() => this.$refs.amount?.focus());
        } else {
          this.$emit('saved');
        }
      } catch {
        const key = this.mode === 'edit' ? 'transactionEditError' : 'transactionCreateError';
        this.$toast.error(this.$t(`transactionList.transactionModal.messages.${key}`));
      } finally {
        this.submitting = false;
      }
    },
    async remove() {
      if (!this.data) return;
      const ok = await confirmDelete(this.$t('transactionList.messages.areYouSureDeleteTransaction'));
      if (!ok) return;
      this.submitting = true;
      try {
        const response = await transactionService.deleteTransaction(this.data.id);
        if (response.status !== 200) throw new Error('delete failed');
        const key = this.data.transactionType === 0 ? 'incomeDeleteSuccess' : 'expenseDeleteSuccess';
        this.$toast.success(this.$t(`transactionList.messages.${key}`));
        this.$emit('saved');
      } catch {
        this.$toast.error(this.$t('transactionList.messages.transactionDeleteError'));
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>

<style scoped>
.tx-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.date-shortcuts {
  display: flex;
  gap: 12px;
}

.date-shortcuts .link-btn {
  font-size: 12px;
}
</style>
