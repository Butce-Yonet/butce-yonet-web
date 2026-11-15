<template>
  <VSelect
    append-to-body
    :calculate-position="position"
    :model-value="modelValue"
    :options="currencies"
    label="code"
    :reduce="(c) => c.id"
    :clearable="clearable"
    :disabled="disabled"
    :searchable="true"
    :filter-by="filterBy"
    :placeholder="placeholder || $t('transactionList.transactionModal.form.placeholder.currencyLabel')"
    :class="{ sm: small }"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #option="c">
      <span class="cur-code">{{ c.code }}</span>
      <span class="cur-name">{{ c.name }}</span>
    </template>
    <template #selected-option="c">
      <span class="cur-code">{{ c.code }}</span>
      <span v-if="showName" class="cur-name">{{ c.name }}</span>
    </template>
    <template #no-options>{{ $t('common.noResults') }}</template>
  </VSelect>
</template>

<script>
import { floatingDropdown } from '@/utils/selectPosition';

export default {
  name: 'CurrencySelect',
  props: {
    modelValue: { type: [Number, String], default: null },
    clearable: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    placeholder: { type: String, default: '' },
    showName: { type: Boolean, default: false },
    small: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  data() {
    // Wide enough to show full currency names even from the narrow amount field.
    return { position: floatingDropdown(240) };
  },
  computed: {
    currencies() {
      return this.$store.getters['dashboard/getCurrencies'];
    },
  },
  methods: {
    filterBy(option, label, search) {
      const q = (search || '').toLowerCase();
      return (option.code || '').toLowerCase().includes(q) || (option.name || '').toLowerCase().includes(q);
    },
  },
};
</script>

<style scoped>
.cur-code {
  font-weight: 650;
}

.cur-name {
  color: var(--text-3);
  font-size: 12.5px;
  margin-left: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
