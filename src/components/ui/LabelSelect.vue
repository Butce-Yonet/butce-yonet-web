<template>
  <div class="label-select">
    <VSelect
      append-to-body
      :calculate-position="position"
      :model-value="modelValue"
      :options="labels"
      label="name"
      :reduce="(l) => l.id"
      :multiple="multiple"
      :clearable="clearable"
      :close-on-select="!multiple"
      :placeholder="placeholder || $t('transactionList.transactionModal.form.placeholder.labelsLabel')"
      :class="{ sm: small }"
      @update:model-value="$emit('update:modelValue', $event)"
    >
      <template #option="l">
        <span class="label-dot" :style="{ background: l.colorCode }"></span>
        {{ l.name }}
      </template>
      <template #selected-option="l">
        <span class="label-dot" :style="{ background: l.colorCode }"></span>
        {{ l.name }}
      </template>
      <template #no-options>
        <span>{{ labels.length ? $t('common.noResults') : $t('labelsPage.emptyTitle') }}</span>
      </template>
    </VSelect>
    <button v-if="allowCreate" type="button" class="link-btn label-create" @click="createLabel">
      <vue-feather type="plus" size="13"></vue-feather>
      {{ $t('labelsPage.addButton') }}
    </button>
  </div>
</template>

<script>
import { floatingDropdown } from '@/utils/selectPosition';

export default {
  name: 'LabelSelect',
  props: {
    modelValue: { type: [Array, Number, String], default: () => [] },
    multiple: { type: Boolean, default: true },
    clearable: { type: Boolean, default: true },
    placeholder: { type: String, default: '' },
    small: { type: Boolean, default: false },
    allowCreate: { type: Boolean, default: false },
  },
  emits: ['update:modelValue', 'create'],
  data() {
    return { position: floatingDropdown(220) };
  },
  computed: {
    labels() {
      return this.$store.getters['dashboard/getLabels'];
    },
  },
  methods: {
    createLabel() {
      this.$emit('create');
    },
  },
};
</script>

<style scoped>
.label-select {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label-create {
  align-self: flex-start;
  font-size: 12.5px;
}
</style>
