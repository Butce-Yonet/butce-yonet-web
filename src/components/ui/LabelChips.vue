<template>
  <span v-if="labels && labels.length" class="label-chips">
    <span
      v-for="label in visible"
      :key="label.id"
      class="chip"
      :style="{ background: soft(label.colorCode), color: label.colorCode }"
    >
      <i class="dot"></i>
      <span>{{ label.name }}</span>
    </span>
    <span v-if="hidden > 0" class="chip">+{{ hidden }}</span>
  </span>
  <span v-else-if="showEmpty" class="chip chip-warn">
    <vue-feather type="alert-circle" size="11"></vue-feather>
    <span>{{ $t('transactionList.noLabel') }}</span>
  </span>
</template>

<script>
import { softColor } from '@/utils/format';

export default {
  name: 'LabelChips',
  props: {
    labels: { type: Array, default: () => [] },
    max: { type: Number, default: 3 },
    showEmpty: { type: Boolean, default: false },
  },
  computed: {
    visible() {
      return this.labels.slice(0, this.max);
    },
    hidden() {
      return Math.max(0, this.labels.length - this.max);
    },
  },
  methods: {
    soft(c) {
      return softColor(c, '1f');
    },
  },
};
</script>

<style scoped>
.label-chips {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 4px;
  min-width: 0;
}

.chip-warn {
  background: var(--warning-soft);
  color: var(--warning);
}
</style>
