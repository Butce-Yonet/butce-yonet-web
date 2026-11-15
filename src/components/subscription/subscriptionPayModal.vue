<template>
  <app-modal
    :open="open"
    :title="$t('subscriptionList.payModal.title')"
    :subtitle="data?.name"
    icon="check-circle"
    tone="income"
    size="sm"
    @close="$emit('close')"
  >
    <form id="subscriptionPayForm" class="pay-form" novalidate @submit.prevent="save">
      <div class="field">
        <label class="field-label" for="pay-amount">{{ $t('subscriptionList.payModal.form.amount') }}</label>
        <div class="amount-field" :class="{ 'is-invalid': showError('amount') || showError('currencyId') }">
          <input
            id="pay-amount"
            v-model.number="form.amount"
            type="number"
            inputmode="decimal"
            step="0.01"
            min="0"
            placeholder="0,00"
            autofocus
          />
          <div class="amount-currency">
            <currency-select v-model="form.currencyId" />
          </div>
        </div>
        <span v-if="showError('amount')" class="field-error">{{ errors.amount }}</span>
        <span v-else-if="showError('currencyId')" class="field-error">{{ errors.currencyId }}</span>
      </div>

      <div class="field">
        <label class="field-label">{{ $t('subscriptionList.payModal.form.paidDate') }}</label>
        <VueDatePicker
          v-model="form.paidDate"
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
      <button type="submit" form="subscriptionPayForm" class="btn btn-primary" :disabled="submitting">
        <span v-if="submitting" class="spinner sm"></span>
        <vue-feather v-else type="check" size="16"></vue-feather>
        {{ $t('subscriptionList.payModal.confirm') }}
      </button>
    </template>
  </app-modal>
</template>

<script>
import * as yup from 'yup';
import AppModal from '@/components/ui/AppModal.vue';
import CurrencySelect from '@/components/ui/CurrencySelect.vue';
import subscriptionService from '@/services/subscription.service';
import { createYupValidator } from '@/services/validator.service';
import { useDateLocale } from '@/composables/useDateLocale';
import { defaultCurrencyId } from '@/utils/format';

export default {
  name: 'SubscriptionPayModal',
  components: { AppModal, CurrencySelect },
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
      form: { amount: null, currencyId: null, paidDate: new Date() },
      errors: {},
      submitted: false,
      submitting: false,
      validator: null,
    };
  },
  watch: {
    open(val) {
      if (!val || !this.data) return;
      this.submitted = false;
      this.errors = {};
      this.form = {
        amount: this.data.amount ?? null,
        currencyId: this.data.currency?.id ?? defaultCurrencyId(this.$store.getters['dashboard/getCurrencies']),
        paidDate: new Date(),
      };
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
      currencyId: yup.mixed().test('currency', req, (v) => v !== null && v !== '' && v !== undefined),
      paidDate: yup.date().nullable(),
    });
    this.validator = createYupValidator(schema);
  },
  methods: {
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
        const response = await subscriptionService.markSubscriptionAsPaid(this.data.id, {
          SubscriptionId: this.data.id,
          Amount: this.form.amount,
          CurrencyId: this.form.currencyId,
          PaidDate: this.form.paidDate,
        });
        if (response.status !== 200) throw new Error('pay failed');
        this.$toast.success(this.$t('subscriptionList.payModal.messages.paySuccess'));
        this.$emit('saved');
      } catch {
        this.$toast.error(this.$t('subscriptionList.payModal.messages.payError'));
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>

<style scoped>
.pay-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.pay-form .amount-currency {
  width: 110px;
}
</style>
