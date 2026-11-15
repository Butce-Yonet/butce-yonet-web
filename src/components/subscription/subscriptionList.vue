<template>
  <div class="stack">
    <div class="page-head">
      <div class="segmented">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          :class="{ active: activeTab === tab.key }"
          @click="selectTab(tab.key)"
        >{{ tab.text }}</button>
      </div>
      <button type="button" class="btn btn-primary hide-mobile" @click="openCreate">
        <vue-feather type="plus" size="16"></vue-feather>
        {{ $t('subscriptionList.addButton') }}
      </button>
    </div>

    <div v-if="loading && !rows.length" class="tile-grid">
      <div v-for="i in 6" :key="i" class="tile sk-tile">
        <div class="skeleton" style="height: 14px; width: 60%"></div>
        <div class="skeleton" style="height: 10px; width: 40%"></div>
        <div class="skeleton" style="height: 24px; width: 50%; margin-top: 16px"></div>
      </div>
    </div>

    <div v-else-if="!rows.length" class="card">
      <empty-state
        icon="file-text"
        :title="activeTab === 'All' ? $t('subscriptionExtra.emptyTitle') : $t('subscriptionExtra.emptyFilteredTitle')"
        :text="activeTab === 'All' ? $t('subscriptionExtra.emptyText') : ''"
      >
        <button v-if="activeTab === 'All'" type="button" class="btn btn-primary btn-sm" @click="openCreate">
          <vue-feather type="plus" size="15"></vue-feather>
          {{ $t('subscriptionList.addButton') }}
        </button>
      </empty-state>
    </div>

    <div v-else class="tile-grid" :class="{ 'is-loading': loading }">
      <div v-for="item in rows" :key="item.id" class="tile" :class="'st-' + (item.status || 'none').toLowerCase()">
        <div class="tile-top">
          <span class="tx-avatar sub-avatar">
            <vue-feather type="file-text" size="17"></vue-feather>
          </span>
          <div class="row-main" style="min-width: 0; flex: 1">
            <div class="tile-title" :title="item.name">{{ item.name }}</div>
            <div class="tile-sub">{{ frequencyText(item) }}</div>
          </div>
          <div class="tile-actions">
            <button type="button" class="btn-icon sm" v-tooltip="$t('common.tooltips.edit')" @click="openEdit(item)">
              <vue-feather type="edit-2" size="15"></vue-feather>
            </button>
            <button type="button" class="btn-icon sm danger" v-tooltip="$t('common.tooltips.delete')" @click="remove(item)">
              <vue-feather type="trash-2" size="15"></vue-feather>
            </button>
          </div>
        </div>

        <div class="sub-amount-row">
          <span class="sub-amount tabular" :class="{ muted: item.amount == null }">
            {{ item.amount == null ? $t('subscriptionExtra.variable') : money(item.amount, item.currency?.code) }}
          </span>
          <span v-if="item.status" class="badge" :class="statusClass(item.status)">{{ statusLabel(item.status) }}</span>
        </div>

        <label-chips v-if="item.labels && item.labels.length" :labels="item.labels" :max="3" />

        <div class="tile-foot">
          <span class="due" :class="{ overdue: item.status === 'Overdue' }">
            <template v-if="item.nextOccurrence">
              <span class="due-rel">{{ relative(item.nextOccurrence) }}</span>
              <span class="due-date">{{ date(item.nextOccurrence) }}</span>
            </template>
            <template v-else>—</template>
          </span>
          <button type="button" class="btn btn-secondary btn-sm pay-btn" @click="openPay(item)">
            <vue-feather type="check" size="14"></vue-feather>
            {{ $t('subscriptionExtra.markPaid') }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="total > pageSize" class="card">
      <app-pagination v-model:page="page" :page-size="pageSize" :page-sizes="[pageSize]" :total="total" />
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import AppPagination from '@/components/ui/AppPagination.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import LabelChips from '@/components/ui/LabelChips.vue';
import subscriptionService from '@/services/subscription.service';
import { computeSubscriptionStatus } from '@/composables/subscriptionStatus';
import { formatMoney, formatDate, describeFrequency } from '@/utils/format';
import { confirmDelete } from '@/utils/confirm';

export default {
  name: 'SubscriptionList',
  components: { AppPagination, EmptyState, LabelChips },
  data() {
    return {
      loading: false,
      activeTab: 'All',
      subscriptions: [],
      total: 0,
      page: 1,
      pageSize: 12,
    };
  },
  computed: {
    tabs() {
      return [
        { key: 'All', text: this.$t('subscriptionList.tabs.all') },
        { key: 'Upcoming', text: this.$t('subscriptionList.tabs.upcoming') },
        { key: 'Overdue', text: this.$t('subscriptionList.tabs.overdue') },
        { key: 'Paid', text: this.$t('subscriptionList.tabs.paid') },
      ];
    },
    rows() {
      return this.subscriptions.map((s) => ({ ...s, status: computeSubscriptionStatus(s) }));
    },
    version() {
      return this.$store.state.ui.versions.subscriptions;
    },
  },
  watch: {
    page() { this.load(); },
    version() { this.load(); },
  },
  mounted() {
    this.load();
  },
  methods: {
    money: formatMoney,
    date(d) {
      return formatDate(d, 'D MMM YYYY');
    },
    relative(d) {
      const days = moment(d).startOf('day').diff(moment().startOf('day'), 'days');
      if (days === 0) return this.$t('common.today');
      if (days === 1) return this.$t('common.tomorrow');
      if (days < 0) return this.$t('subscriptionExtra.daysLate', { n: Math.abs(days) }, Math.abs(days));
      return this.$t('subscriptionExtra.inDays', { n: days }, days);
    },
    frequencyText(item) {
      return describeFrequency(this.$t, item.frequency, item.interval);
    },
    statusLabel(status) {
      return {
        Paid: this.$t('subscriptionList.tabs.paid'),
        Overdue: this.$t('subscriptionList.tabs.overdue'),
        Upcoming: this.$t('subscriptionList.tabs.upcoming'),
      }[status] || '';
    },
    statusClass(status) {
      return { Paid: 'success', Overdue: 'danger', Upcoming: 'warning' }[status] || '';
    },
    selectTab(key) {
      if (this.activeTab === key) return;
      this.activeTab = key;
      if (this.page !== 1) this.page = 1;
      else this.load();
    },
    async load() {
      this.loading = true;
      const params = {
        PageNumber: this.page,
        PageSize: this.pageSize,
        SortColumn: '',
        SortDirection: 'Ascending',
      };
      if (this.activeTab !== 'All') params.Status = this.activeTab;
      try {
        const response = await subscriptionService.getAllSubscriptions(params);
        if (response.status !== 200) throw new Error('load failed');
        this.total = response.data.data.totalRecords;
        this.subscriptions = response.data.data.items || [];
      } catch {
        this.$toast.error(this.$t('subscriptionList.messages.loadError'));
      } finally {
        this.loading = false;
      }
    },
    openCreate() {
      this.$store.dispatch('ui/openModal', { type: 'subscription', mode: 'create' });
    },
    openEdit(item) {
      this.$store.dispatch('ui/openModal', { type: 'subscription', mode: 'edit', data: item });
    },
    openPay(item) {
      this.$store.dispatch('ui/openModal', { type: 'subscriptionPay', data: item });
    },
    async remove(item) {
      const ok = await confirmDelete(this.$t('subscriptionList.messages.areYouSureDelete'));
      if (!ok) return;
      try {
        const response = await subscriptionService.deleteSubscription(item.id);
        if (response.status !== 200) throw new Error('delete failed');
        this.$toast.success(this.$t('subscriptionList.messages.deleteSuccess'));
        this.$store.dispatch('ui/bump', 'subscriptions');
      } catch {
        this.$toast.error(this.$t('subscriptionList.messages.deleteError'));
      }
    },
  },
};
</script>

<style scoped>
.page-head {
  margin-bottom: 0;
}

.is-loading {
  opacity: 0.55;
  transition: opacity 0.15s;
}

.sub-avatar {
  background: var(--warning-soft);
  color: var(--warning);
}

.st-overdue .sub-avatar {
  background: var(--danger-soft);
  color: var(--danger);
}

.st-paid .sub-avatar {
  background: var(--income-soft);
  color: var(--income);
}

.st-overdue {
  border-color: color-mix(in srgb, var(--danger) 35%, var(--border));
}

.sub-amount-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.sub-amount {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.sub-amount.muted {
  font-size: 15px;
  font-weight: 600;
}

.due {
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.3;
}

.due-rel {
  font-size: 13px;
  font-weight: 650;
  color: var(--text);
  white-space: nowrap;
}

.due-date {
  font-size: 12px;
  color: var(--text-3);
  white-space: nowrap;
}

.due.overdue .due-rel {
  color: var(--danger);
}

.pay-btn {
  flex-shrink: 0;
}

.sk-tile {
  min-height: 160px;
}
</style>
