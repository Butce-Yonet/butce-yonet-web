<template>
  <div class="qa-list">
    <button
      v-for="a in actions"
      :key="a.type"
      type="button"
      class="menu-item"
      @click="$emit('select', a.type)"
    >
      <span class="menu-icon" :class="'qa-' + a.tone">
        <vue-feather :type="a.icon" size="16"></vue-feather>
      </span>
      <span class="menu-text">
        {{ $t(a.title) }}
        <span class="menu-desc">{{ $t(a.desc) }}</span>
      </span>
      <span v-if="a.shortcut" class="kbd hide-mobile">{{ a.shortcut }}</span>
    </button>
  </div>
</template>

<script>
import { quickActions } from '@/constants/navigation';

export default {
  name: 'QuickActionList',
  emits: ['select'],
  data() {
    return { actions: quickActions };
  },
};
</script>

<style scoped>
.qa-brand { background: var(--primary-soft); color: var(--primary); }
.qa-info { background: var(--info-soft); color: var(--info); }
.qa-warning { background: var(--warning-soft); color: var(--warning); }
.qa-saving { background: var(--saving-soft); color: var(--saving); }
.qa-neutral { background: var(--surface-3); color: var(--text-2); }
</style>
