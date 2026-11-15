<template>
  <div class="card">
    <!-- Toolbar -->
    <div class="toolbar">
      <div class="input-wrap tx-search">
        <vue-feather type="search" size="16" class="input-icon"></vue-feather>
        <input
          v-model="filters.name"
          class="input sm"
          type="search"
          :placeholder="$t('transactionsExtra.searchPlaceholder')"
        />
      </div>

      <div class="segmented sm">
        <button
          v-for="opt in typeOptions"
          :key="String(opt.value)"
          type="button"
          :class="{ active: filters.transactionType === opt.value }"
          @click="filters.transactionType = opt.value"
        >{{ opt.text }}</button>
      </div>

      <period-picker v-model="filters.transactionDate" small />

      <button
        type="button"
        class="btn btn-secondary btn-sm"
        :class="{ 'is-active': showAdvanced || advancedCount > 0 }"
        @click="showAdvanced = !showAdvanced"
      >
        <vue-feather type="sliders" size="14"></vue-feather>
        <span class="hide-mobile">{{ $t('transactionsExtra.moreFilters') }}</span>
        <span v-if="advancedCount" class="count-pill">{{ advancedCount }}</span>
      </button>
    </div>

    <!-- Advanced filters -->
    <transition name="fade">
      <div v-if="showAdvanced" class="adv-filters">
        <div class="field">
          <label class="field-label">{{ $t('transactionList.table.headers.currency') }}</label>
          <currency-select v-model="filters.currencyId" clearable small show-name :placeholder="$t('common.all')" />
        </div>
        <div class="field adv-labels">
          <label class="field-label">{{ $t('transactionList.table.headers.labels') }}</label>
          <label-select v-model="filters.labelIds" small :placeholder="$t('common.all')" />
        </div>
        <div class="field">
          <label class="field-label">{{ $t('transactionList.table.headers.description') }}</label>
          <input v-model="filters.description" class="input sm" :placeholder="$t('transactionList.table.headers.description')" />
        </div>
        <div class="field">
          <label class="field-label">{{ $t('transactionList.table.headers.amount') }}</label>
          <input v-model="filters.amount" type="number" inputmode="decimal" class="input sm" :placeholder="$t('transactionsExtra.exactAmount')" />
        </div>
      </div>
    </transition>

    <!-- Active filter chips -->
    <div v-if="activeChips.length" class="filter-chips">
      <span v-for="chip in activeChips" :key="chip.key" class="filter-chip">
        {{ chip.text }}
        <button type="button" :aria-label="$t('common.remove')" @click="chip.clear()">
          <vue-feather type="x" size="12"></vue-feather>
        </button>
      </span>
      <button type="button" class="link-btn" @click="clearFilters">{{ $t('common.clearFilters') }}</button>
    </div>

    <!-- Body -->
    <div v-if="loading && !transactions.length" class="skeleton-list">
      <div v-for="i in 6" :key="i" class="sk-row">
        <div class="skeleton sk-avatar"></div>
        <div class="sk-lines">
          <div class="skeleton sk-line w60"></div>
          <div class="skeleton sk-line w30"></div>
        </div>
        <div class="skeleton sk-line w15"></div>
      </div>
    </div>

    <empty-state
      v-else-if="!transactions.length"
      :icon="hasActiveFilters ? 'search' : 'inbox'"
      :title="hasActiveFilters ? $t('transactionsExtra.noMatchTitle') : $t('transactionsExtra.emptyTitle')"
      :text="hasActiveFilters ? $t('transactionsExtra.noMatchText') : $t('transactionsExtra.emptyText')"
    >
      <button v-if="hasActiveFilters" type="button" class="btn btn-secondary btn-sm" @click="clearFilters">
        {{ $t('common.clearFilters') }}
      </button>
      <button v-else type="button" class="btn btn-primary btn-sm" @click="openCreate">
        <vue-feather type="plus" size="15"></vue-feather>
        {{ $t('header.newTransaction') }}
      </button>
    </empty-state>

    <div v-else class="tx-groups" :class="{ 'is-loading': loading }">
      <template v-for="group in groups" :key="group.key">
        <div class="list-group-head">
          <span>{{ group.title }}</span>
        </div>
        <div
          v-for="tx in group.items"
          :key="tx.id"
          class="list-row clickable"
          tabindex="0"
          @click="openEdit(tx)"
          @keydown.enter="openEdit(tx)"
        >
          <span class="tx-avatar" :class="tone(tx.transactionType)">
            <vue-feather :type="icon(tx.transactionType)" size="17"></vue-feather>
          </span>
          <div class="row-main">
            <div class="row-title">{{ tx.name }}</div>
            <div class="row-meta">
              <span v-if="tx.description" class="truncate tx-desc">{{ tx.description }}</span>
              <label-chips :labels="tx.labels" :max="2" :show-empty="tx.transactionType !== 2" />
            </div>
          </div>
          <div class="row-end">
            <span class="amount" :class="tone(tx.transactionType)">
              {{ sign(tx.transactionType) }}{{ money(tx.amount, tx.currency?.code) }}
            </span>
            <span v-if="tx.transactionType === 2" class="badge saving">
              <vue-feather type="lock" size="10"></vue-feather>
              {{ $t('common.saving') }}
            </span>
          </div>
          <div class="row-actions" @click.stop>
            <template v-if="tx.transactionType !== 2">
              <button type="button" class="btn-icon sm" v-tooltip="$t('common.tooltips.edit')" @click="openEdit(tx)">
                <vue-feather type="edit-2" size="15"></vue-feather>
              </button>
              <button type="button" class="btn-icon sm danger" v-tooltip="$t('common.tooltips.delete')" @click="remove(tx)">
                <vue-feather type="trash-2" size="15"></vue-feather>
              </button>
            </template>
            <span v-else class="btn-icon sm" v-tooltip="$t('transactionList.savingLocked')">
              <vue-feather type="lock" size="15"></vue-feather>
            </span>
          </div>
        </div>
      </template>
    </div>

    <app-pagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="total"
    />
  </div>
</template>

<script>
import moment from 'moment';
import AppPagination from '@/components/ui/AppPagination.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import PeriodPicker from '@/components/ui/PeriodPicker.vue';
import CurrencySelect from '@/components/ui/CurrencySelect.vue';
import LabelSelect from '@/components/ui/LabelSelect.vue';
import LabelChips from '@/components/ui/LabelChips.vue';
import transactionService from '@/services/transaction.service';
import { getDefaultDateRange, isDefaultDateRange } from '@/composables/dateRangePresets';
import { formatMoney, formatDayHeading, txTone, txIcon, txSign } from '@/utils/format';
import { confirmDelete } from '@/utils/confirm';

// Filters passed in the URL (e.g. "View transactions" on a budget):
// ?type=1&currencyId=1&labelIds=12,13&start=2026-11-01&end=2026-11-30
function filtersFromQuery(query = {}) {
  const f = defaultFilters();
  const num = (v) => (v !== undefined && v !== '' && /^\d+$/.test(String(v)) ? Number(v) : null);
  if (num(query.type) !== null && [0, 1, 2].includes(num(query.type))) f.transactionType = num(query.type);
  if (num(query.currencyId) !== null) f.currencyId = num(query.currencyId);
  if (query.labelIds) f.labelIds = String(query.labelIds).split(',').map(num).filter((v) => v !== null);
  const start = moment(query.start, 'YYYY-MM-DD', true);
  const end = moment(query.end, 'YYYY-MM-DD', true);
  if (start.isValid() && end.isValid() && !end.isBefore(start)) {
    f.transactionDate = [start.startOf('day').toDate(), end.endOf('day').toDate()];
  }
  return f;
}

function defaultFilters() {
  return {
    currencyId: null,
    transactionType: null,
    name: '',
    description: '',
    amount: '',
    transactionDate: getDefaultDateRange(),
    labelIds: [],
  };
}

export default {
  name: 'TransactionList',
  components: { AppPagination, EmptyState, PeriodPicker, CurrencySelect, LabelSelect, LabelChips },
  data() {
    return {
      filters: filtersFromQuery(this.$route.query),
      showAdvanced: false,
      debounce: null,
      loading: false,
      transactions: [],
      total: 0,
      page: 1,
      pageSize: 25,
      requestId: 0,
    };
  },
  computed: {
    typeOptions() {
      return [
        { value: null, text: this.$t('common.all') },
        { value: 1, text: this.$t('common.expense') },
        { value: 0, text: this.$t('common.income') },
        { value: 2, text: this.$t('common.saving') },
      ];
    },
    advancedCount() {
      let n = 0;
      if (this.filters.currencyId !== null) n++;
      if (this.filters.labelIds.length) n++;
      if (this.filters.description) n++;
      if (this.filters.amount !== '' && this.filters.amount !== null) n++;
      return n;
    },
    hasActiveFilters() {
      return this.activeChips.length > 0;
    },
    activeChips() {
      const f = this.filters;
      const chips = [];
      if (f.name) chips.push({ key: 'name', text: `“${f.name}”`, clear: () => { f.name = ''; } });
      if (f.transactionType !== null) {
        chips.push({ key: 'type', text: this.typeOptions.find((o) => o.value === f.transactionType)?.text, clear: () => { f.transactionType = null; } });
      }
      if (!isDefaultDateRange(f.transactionDate)) {
        chips.push({ key: 'date', text: this.rangeText(f.transactionDate), clear: () => { f.transactionDate = getDefaultDateRange(); } });
      }
      if (f.currencyId !== null) {
        const c = this.$store.getters['dashboard/getCurrencies'].find((x) => x.id === f.currencyId);
        chips.push({ key: 'cur', text: c?.code || '—', clear: () => { f.currencyId = null; } });
      }
      if (f.labelIds.length) {
        const all = this.$store.getters['dashboard/getLabels'];
        const names = f.labelIds.map((id) => all.find((l) => l.id === id)?.name).filter(Boolean);
        chips.push({ key: 'labels', text: names.join(', '), clear: () => { f.labelIds = []; } });
      }
      if (f.description) chips.push({ key: 'desc', text: `${this.$t('transactionList.table.headers.description')}: ${f.description}`, clear: () => { f.description = ''; } });
      if (f.amount !== '' && f.amount !== null) chips.push({ key: 'amount', text: `${this.$t('transactionList.table.headers.amount')}: ${f.amount}`, clear: () => { f.amount = ''; } });
      return chips;
    },
    groups() {
      const map = new Map();
      this.transactions.forEach((tx) => {
        const key = moment(tx.transactionDate).format('YYYY-MM-DD');
        if (!map.has(key)) map.set(key, { key, title: formatDayHeading(tx.transactionDate), items: [] });
        map.get(key).items.push(tx);
      });
      return Array.from(map.values());
    },
    version() {
      return this.$store.state.ui.versions.transactions;
    },
  },
  watch: {
    filters: {
      deep: true,
      handler() {
        clearTimeout(this.debounce);
        this.debounce = setTimeout(() => {
          if (this.page !== 1) this.page = 1;
          else this.load();
        }, 350);
      },
    },
    page() {
      this.load();
    },
    pageSize() {
      if (this.page !== 1) this.page = 1;
      else this.load();
    },
    version() {
      this.load();
    },
  },
  mounted() {
    this.load();
  },
  beforeUnmount() {
    clearTimeout(this.debounce);
  },
  methods: {
    money: formatMoney,
    tone: txTone,
    icon: txIcon,
    sign: txSign,
    rangeText(range) {
      const [s, e] = range || [];
      if (!s || !e) return '';
      return `${moment(s).format('DD.MM.YYYY')} – ${moment(e).format('DD.MM.YYYY')}`;
    },
    clearFilters() {
      this.filters = defaultFilters();
    },
    async load() {
      const id = ++this.requestId;
      this.loading = true;
      const [start, end] = this.filters.transactionDate || [];
      const f = this.filters;
      const params = {
        PageNumber: this.page,
        PageSize: this.pageSize,
        SortColumn: '',
        SortDirection: 'Descending',
        StartTime: start ? moment(start).startOf('day').toISOString() : null,
        EndTime: end ? moment(end).endOf('day').toISOString() : null,
        Name: f.name || null,
        Description: f.description || null,
        Amount: f.amount !== '' && f.amount !== null ? f.amount : null,
        CurrencyId: f.currencyId ?? null,
        TransactionType: f.transactionType,
        LabelIds: f.labelIds.length ? f.labelIds : [],
      };
      try {
        const response = await transactionService.getAllTransactions(params);
        if (id !== this.requestId) return;
        if (response.status !== 200) throw new Error('load failed');
        this.total = response.data.data.totalRecords;
        this.transactions = response.data.data.items || [];
      } catch {
        if (id === this.requestId) this.$toast.error(this.$t('transactionList.messages.transactionsLoadError'));
      } finally {
        if (id === this.requestId) this.loading = false;
      }
    },
    openCreate() {
      this.$store.dispatch('ui/openModal', { type: 'transaction', mode: 'create' });
    },
    openEdit(tx) {
      if (tx.transactionType === 2) {
        this.$toast.info(this.$t('transactionList.savingLocked'));
        return;
      }
      this.$store.dispatch('ui/openModal', { type: 'transaction', mode: 'edit', data: tx });
    },
    async remove(tx) {
      const ok = await confirmDelete(this.$t('transactionList.messages.areYouSureDeleteTransaction'));
      if (!ok) return;
      try {
        const response = await transactionService.deleteTransaction(tx.id);
        if (response.status !== 200) throw new Error('delete failed');
        const key = tx.transactionType === 0 ? 'incomeDeleteSuccess' : 'expenseDeleteSuccess';
        this.$toast.success(this.$t(`transactionList.messages.${key}`));
        this.$store.dispatch('ui/bump', 'transactions');
      } catch {
        this.$toast.error(this.$t('transactionList.messages.transactionDeleteError'));
      }
    },
  },
};
</script>

<style scoped>
.tx-search {
  flex: 1 1 220px;
  min-width: 180px;
  max-width: 320px;
}

.adv-filters {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border);
  background: var(--surface-2);
}

@media (max-width: 1100px) {
  .adv-filters {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .tx-search {
    max-width: none;
    flex-basis: 100%;
  }

  .adv-filters {
    grid-template-columns: minmax(0, 1fr);
    padding: 14px 16px;
  }
}

.tx-groups {
  transition: opacity 0.15s;
}

.tx-groups.is-loading {
  opacity: 0.55;
  pointer-events: none;
}

.tx-desc {
  max-width: 260px;
}

.skeleton-list {
  padding: 8px 0;
}

.sk-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
}

.sk-avatar {
  width: 38px;
  height: 38px;
  border-radius: 11px;
}

.sk-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sk-line {
  height: 10px;
}

.w60 { width: 60%; }
.w30 { width: 30%; }
.w15 { width: 80px; }
</style>
