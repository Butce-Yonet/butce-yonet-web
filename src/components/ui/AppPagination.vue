<template>
  <div v-if="total > 0" class="pager">
    <div class="pager-info">
      <span class="tabular">{{ rangeText }}</span>
      <select
        v-if="pageSizes.length > 1"
        class="select sm pager-size"
        :value="pageSize"
        :aria-label="$t('pagination.perPage')"
        @change="$emit('update:pageSize', Number($event.target.value))"
      >
        <option v-for="s in pageSizes" :key="s" :value="s">{{ $t('pagination.perPageOption', { n: s }) }}</option>
      </select>
    </div>
    <div class="row">
      <button
        type="button"
        class="btn-icon sm bordered"
        :disabled="page <= 1"
        :aria-label="$t('common.previous')"
        @click="$emit('update:page', page - 1)"
      >
        <vue-feather type="chevron-left" size="16"></vue-feather>
      </button>
      <span class="pager-page tabular">{{ page }} / {{ totalPages }}</span>
      <button
        type="button"
        class="btn-icon sm bordered"
        :disabled="page >= totalPages"
        :aria-label="$t('common.next')"
        @click="$emit('update:page', page + 1)"
      >
        <vue-feather type="chevron-right" size="16"></vue-feather>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppPagination',
  props: {
    page: { type: Number, required: true },
    pageSize: { type: Number, required: true },
    total: { type: Number, default: 0 },
    pageSizes: { type: Array, default: () => [10, 25, 50] },
  },
  emits: ['update:page', 'update:pageSize'],
  computed: {
    totalPages() {
      return Math.max(1, Math.ceil(this.total / this.pageSize));
    },
    rangeText() {
      const start = (this.page - 1) * this.pageSize + 1;
      const end = Math.min(this.page * this.pageSize, this.total);
      return this.$t('pagination.range', { start, end, total: this.total });
    },
  },
};
</script>

<style scoped>
.pager-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pager-size {
  width: auto;
  height: 30px;
  font-size: 12.5px;
  padding-left: 8px;
}

.pager-page {
  min-width: 56px;
  text-align: center;
  font-weight: 600;
  color: var(--text-2);
}

@media (max-width: 480px) {
  .pager-size {
    display: none;
  }
}
</style>
