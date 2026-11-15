<template>
  <app-modal :open="open" :title="formattedDate" :subtitle="summaryText" icon="calendar" size="md" @close="$emit('close')">
    <div v-if="loading" class="loading-box"><span class="spinner lg"></span></div>

    <empty-state v-else-if="!transactions.length" icon="inbox" :text="$t('calendarPage.noTransactions')" compact />

    <div v-else class="day-list">
      <div
        v-for="tx in transactions"
        :key="tx.id"
        class="list-row"
        :class="{ clickable: tx.transactionType !== 2 }"
        @click="$emit('edit', tx)"
      >
        <span class="tx-avatar sm" :class="tone(tx.transactionType)">
          <vue-feather :type="icon(tx.transactionType)" size="15"></vue-feather>
        </span>
        <div class="row-main">
          <div class="row-title">{{ tx.name }}</div>
          <div class="row-meta">
            <span v-if="tx.description" class="truncate">{{ tx.description }}</span>
            <label-chips :labels="tx.labels" :max="2" />
          </div>
        </div>
        <span class="amount" :class="tone(tx.transactionType)">
          {{ sign(tx.transactionType) }}{{ money(tx.amount, tx.currency?.code) }}
        </span>
      </div>
    </div>

    <template #footer>
      <button type="button" class="btn btn-secondary" @click="$emit('close')">{{ $t('common.close') }}</button>
      <button type="button" class="btn btn-primary" @click="$emit('add')">
        <vue-feather type="plus" size="16"></vue-feather>
        {{ $t('calendarExtra.addForDay') }}
      </button>
    </template>
  </app-modal>
</template>

<script>
import moment from 'moment';
import AppModal from '@/components/ui/AppModal.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import LabelChips from '@/components/ui/LabelChips.vue';
import { formatMoney, txTone, txIcon, txSign } from '@/utils/format';

export default {
  name: 'DayDetailModal',
  components: { AppModal, EmptyState, LabelChips },
  props: {
    open: { type: Boolean, default: false },
    date: { type: Date, default: null },
    transactions: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
  },
  emits: ['close', 'edit', 'add'],
  computed: {
    formattedDate() {
      if (!this.date) return '';
      return moment(this.date).locale(this.$i18n.locale).format('D MMMM YYYY, dddd');
    },
    summaryText() {
      if (this.loading || !this.transactions.length) return '';
      return this.$t('calendarExtra.recordCount', { n: this.transactions.length }, this.transactions.length);
    },
  },
  methods: {
    money: formatMoney,
    tone: txTone,
    icon: txIcon,
    sign: txSign,
  },
};
</script>

<style scoped>
.day-list {
  margin: -8px -24px -24px;
}

.day-list .list-row {
  padding-left: 24px;
  padding-right: 24px;
}

@media (max-width: 640px) {
  .day-list {
    margin: -8px -20px -20px;
  }
}
</style>
