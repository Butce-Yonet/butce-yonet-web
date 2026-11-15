<template>
  <div class="quick-add" v-click-outside="close">
    <div class="split">
      <button type="button" class="btn btn-primary split-main" @click="open('transaction')">
        <vue-feather type="plus" size="16"></vue-feather>
        {{ $t('header.newTransaction') }}
      </button>
      <button
        type="button"
        class="btn btn-primary split-caret"
        :aria-label="$t('quickAdd.more')"
        :aria-expanded="isOpen"
        @click="isOpen = !isOpen"
      >
        <vue-feather type="chevron-down" size="16"></vue-feather>
      </button>
    </div>

    <transition name="pop">
      <div v-if="isOpen" class="menu qa-menu">
        <quick-action-list @select="open" />
      </div>
    </transition>
  </div>
</template>

<script>
import QuickActionList from './QuickActionList.vue';

export default {
  name: 'QuickAddMenu',
  components: { QuickActionList },
  data() {
    return { isOpen: false };
  },
  methods: {
    close() {
      this.isOpen = false;
    },
    open(type) {
      this.isOpen = false;
      this.$store.dispatch('ui/openModal', { type, mode: 'create' });
    },
  },
};
</script>

<style scoped>
.quick-add {
  position: relative;
}

.split {
  display: inline-flex;
}

.split-main {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.split-caret {
  width: 34px;
  padding: 0;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-left: 1px solid rgba(255, 255, 255, 0.25);
}

.qa-menu {
  top: calc(100% + 8px);
  right: 0;
  width: 300px;
}
</style>
