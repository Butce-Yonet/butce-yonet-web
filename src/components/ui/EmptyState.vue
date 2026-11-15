<template>
  <div class="empty" :class="{ compact }">
    <div class="empty-icon">
      <vue-feather :type="icon" :size="compact ? 18 : 22"></vue-feather>
    </div>
    <div v-if="title" class="empty-title">{{ title }}</div>
    <div v-if="text" class="empty-text">{{ text }}</div>
    <div v-if="$slots.default" class="empty-action">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EmptyState',
  props: {
    icon: { type: String, default: 'inbox' },
    title: { type: String, default: '' },
    text: { type: String, default: '' },
    compact: { type: Boolean, default: false },
  },
};
</script>
