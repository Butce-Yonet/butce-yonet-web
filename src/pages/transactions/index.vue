<template>
  <div class="page">
    <div class="page-head">
      <div class="segmented">
        <button type="button" :class="{ active: tab === 'list' }" @click="setTab('list')">
          <vue-feather type="list" size="15"></vue-feather>
          {{ $t('transactionsPage.tabs.transactions') }}
        </button>
        <button type="button" :class="{ active: tab === 'recurring' }" @click="setTab('recurring')">
          <vue-feather type="repeat" size="15"></vue-feather>
          {{ $t('transactionsPage.tabs.recurring') }}
        </button>
      </div>
      <div class="page-actions hide-mobile">
        <button v-if="tab === 'recurring'" type="button" class="btn btn-secondary" @click="openRecurring">
          <vue-feather type="plus" size="16"></vue-feather>
          {{ $t('header.newRecurringTransaction') }}
        </button>
      </div>
    </div>

    <transaction-list v-if="tab === 'list'" />
    <recurring-transaction-list v-else />
  </div>
</template>

<script>
import TransactionList from '@/components/transaction/transactionList.vue';
import RecurringTransactionList from '@/components/recurringtransaction/recurringTransactionList.vue';

export default {
  name: 'TransactionsPage',
  components: { TransactionList, RecurringTransactionList },
  data() {
    return { tab: this.$route.query.tab === 'recurring' ? 'recurring' : 'list' };
  },
  watch: {
    '$route.query.tab'(val) {
      this.tab = val === 'recurring' ? 'recurring' : 'list';
    },
  },
  methods: {
    setTab(tab) {
      this.tab = tab;
      this.$router.replace({ query: tab === 'recurring' ? { tab } : {} });
    },
    openRecurring() {
      this.$store.dispatch('ui/openModal', { type: 'recurring', mode: 'create' });
    },
  },
};
</script>
