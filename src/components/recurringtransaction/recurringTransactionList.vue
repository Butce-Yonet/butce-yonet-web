<template>
  <div class="card">
    <div v-if="loading && !items.length" class="loading-box"><span class="spinner lg"></span></div>

    <empty-state
      v-else-if="!items.length"
      icon="refresh-cw"
      :title="$t('recurringExtra.emptyTitle')"
      :text="$t('recurringExtra.emptyText')"
    >
      <button type="button" class="btn btn-primary btn-sm" @click="openCreate">
        <vue-feather type="plus" size="15"></vue-feather>
        {{ $t('header.newRecurringTransaction') }}
      </button>
    </empty-state>

    <div v-else :class="{ 'is-loading': loading }" class="rt-list">
      <div
        v-for="item in items"
        :key="item.id"
        class="list-row clickable"
        tabindex="0"
        @click="openEdit(item)"
        @keydown.enter="openEdit(item)"
      >
        <span class="tx-avatar" :class="tone(item.transaction?.transactionType)">
          <vue-feather type="repeat" size="17"></vue-feather>
        </span>
        <div class="row-main">
          <div class="row-title">{{ item.name || item.transaction?.name }}</div>
          <div class="row-meta">
            <span class="badge">{{ frequencyText(item) }}</span>
            <span v-if="item.nextOccurrence" class="next">
              <vue-feather type="clock" size="12"></vue-feather>
              {{ $t('recurringExtra.next') }}: {{ date(item.nextOccurrence) }}
            </span>
            <span v-if="item.endDate" class="next muted">{{ $t('recurringExtra.until', { date: date(item.endDate) }) }}</span>
            <label-chips :labels="item.transaction?.labels || []" :max="2" />
          </div>
        </div>
        <div class="row-end">
          <span class="amount" :class="tone(item.transaction?.transactionType)">
            {{ sign(item.transaction?.transactionType) }}{{ money(item.transaction?.amount, item.transaction?.currency?.code) }}
          </span>
        </div>
        <div class="row-actions" @click.stop>
          <button type="button" class="btn-icon sm" v-tooltip="$t('common.tooltips.edit')" @click="openEdit(item)">
            <vue-feather type="edit-2" size="15"></vue-feather>
          </button>
          <button type="button" class="btn-icon sm danger" v-tooltip="$t('common.tooltips.delete')" @click="remove(item)">
            <vue-feather type="trash-2" size="15"></vue-feather>
          </button>
        </div>
      </div>
    </div>

    <app-pagination v-model:page="page" v-model:page-size="pageSize" :total="total" />
  </div>
</template>

<script>
import AppPagination from '@/components/ui/AppPagination.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import LabelChips from '@/components/ui/LabelChips.vue';
import recurringTransactionService from '@/services/recurring.transaction.service';
import { formatMoney, formatDate, describeFrequency, txTone, txSign } from '@/utils/format';
import { confirmDelete } from '@/utils/confirm';

export default {
  name: 'RecurringTransactionList',
  components: { AppPagination, EmptyState, LabelChips },
  data() {
    return {
      loading: false,
      items: [],
      total: 0,
      page: 1,
      pageSize: 10,
    };
  },
  computed: {
    version() {
      return this.$store.state.ui.versions.recurring;
    },
  },
  watch: {
    page() { this.load(); },
    pageSize() {
      if (this.page !== 1) this.page = 1;
      else this.load();
    },
    version() { this.load(); },
  },
  mounted() {
    this.load();
  },
  methods: {
    money: formatMoney,
    tone: txTone,
    sign: txSign,
    date(d) {
      return formatDate(d, 'D MMM YYYY');
    },
    frequencyText(item) {
      return describeFrequency(this.$t, item.frequency, item.interval);
    },
    async load() {
      this.loading = true;
      try {
        const response = await recurringTransactionService.getAllRecurringTransactions({
          PageNumber: this.page,
          PageSize: this.pageSize,
          SortColumn: '',
          SortDirection: 'Ascending',
        });
        if (response.status !== 200) throw new Error('load failed');
        this.total = response.data.data.totalRecords;
        this.items = response.data.data.items || [];
      } catch {
        this.$toast.error(this.$t('recurringTransactionList.messages.recurringTransactionsLoadError'));
      } finally {
        this.loading = false;
      }
    },
    openCreate() {
      this.$store.dispatch('ui/openModal', { type: 'recurring', mode: 'create' });
    },
    openEdit(item) {
      this.$store.dispatch('ui/openModal', { type: 'recurring', mode: 'edit', data: item });
    },
    async remove(item) {
      const ok = await confirmDelete(this.$t('recurringTransactionList.messages.areYouSureDelete'));
      if (!ok) return;
      try {
        const response = await recurringTransactionService.deleteRecurringTransaction(item.id);
        if (response.status !== 200) throw new Error('delete failed');
        const key = item.transaction?.transactionType === 0 ? 'incomeDeleteSuccess' : 'expenseDeleteSuccess';
        this.$toast.success(this.$t(`recurringTransactionList.messages.${key}`));
        this.$store.dispatch('ui/bump', 'recurring');
      } catch {
        this.$toast.error(this.$t('recurringTransactionList.messages.recurringTransactionDeleteError'));
      }
    },
  },
};
</script>

<style scoped>
.rt-list {
  transition: opacity 0.15s;
}

.rt-list.is-loading {
  opacity: 0.55;
}

.next {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
</style>
