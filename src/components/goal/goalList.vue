<template>
  <div class="stack">
    <!-- Metrics -->
    <div v-if="metrics" class="card metrics">
      <div class="stat">
        <div class="stat-label">{{ $t('goalList.metrics.totalSaved') }}</div>
        <div class="stat-value">{{ metricMoney(metrics.totalSavedAmount) }}</div>
        <div class="stat-foot">
          {{ $t('goalExtra.ofTarget', { target: metricMoney(metrics.totalTargetAmount) }) }}
        </div>
        <div class="progress sm overall">
          <div class="progress-fill saving-fill" :style="{ width: overallPct + '%' }"></div>
        </div>
      </div>
      <div class="stat">
        <div class="stat-label">{{ $t('goalList.metrics.activeCount') }}</div>
        <div class="stat-value">{{ metrics.activeGoalCount }}</div>
      </div>
      <div class="stat">
        <div class="stat-label">{{ $t('goalList.metrics.completedCount') }}</div>
        <div class="stat-value">{{ metrics.completedGoalCount }}</div>
      </div>
    </div>

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
        {{ $t('goalList.addButton') }}
      </button>
    </div>

    <div v-if="loading && !goals.length" class="tile-grid">
      <div v-for="i in 3" :key="i" class="tile" style="min-height: 190px">
        <div class="skeleton" style="height: 14px; width: 60%"></div>
        <div class="skeleton" style="height: 8px; width: 100%; margin-top: 24px"></div>
        <div class="skeleton" style="height: 10px; width: 40%"></div>
      </div>
    </div>

    <div v-else-if="!goals.length" class="card">
      <empty-state
        icon="target"
        :title="activeTab === 'All' ? $t('goalExtra.emptyTitle') : $t('goalExtra.emptyFilteredTitle')"
        :text="activeTab === 'All' ? $t('goalExtra.emptyText') : ''"
      >
        <button v-if="activeTab === 'All'" type="button" class="btn btn-primary btn-sm" @click="openCreate">
          <vue-feather type="plus" size="15"></vue-feather>
          {{ $t('goalList.addButton') }}
        </button>
      </empty-state>
    </div>

    <div v-else class="tile-grid" :class="{ 'is-loading': loading }">
      <div v-for="item in goals" :key="item.id" class="tile" :class="{ done: item.isCompleted }">
        <div class="tile-top">
          <span class="tx-avatar" :class="item.isCompleted ? 'income' : 'saving'">
            <vue-feather :type="item.isCompleted ? 'award' : 'target'" size="17"></vue-feather>
          </span>
          <div style="min-width: 0; flex: 1">
            <div class="tile-title" :title="item.name">{{ item.name }}</div>
            <div class="tile-sub">
              <template v-if="item.isCompleted">{{ $t('goalList.completedBadge') }}</template>
              <template v-else-if="item.deadline">{{ deadlineText(item.deadline) }}</template>
              <template v-else>{{ $t('goalList.noDeadline') }}</template>
            </div>
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

        <div class="goal-amounts">
          <span class="goal-current tabular">{{ money(item.currentAmount, item.currency?.code) }}</span>
          <span class="muted tabular">/ {{ money(item.targetAmount, item.currency?.code) }}</span>
        </div>

        <div class="goal-progress">
          <div class="progress">
            <div
              class="progress-fill"
              :class="item.isCompleted ? 'done-fill' : 'saving-fill'"
              :style="{ width: Math.min(100, item.progressPercent || 0) + '%' }"
            ></div>
          </div>
          <span class="goal-pct tabular">{{ pct(item.progressPercent) }}%</span>
        </div>

        <label-chips v-if="item.labels && item.labels.length" :labels="item.labels" :max="3" />

        <div class="tile-foot">
          <span class="text-2 goal-remaining">
            <template v-if="!item.isCompleted">
              {{ $t('goalList.card.remaining') }}: <strong class="tabular">{{ money(item.remainingAmount, item.currency?.code) }}</strong>
            </template>
            <template v-else>🎉</template>
          </span>
          <button v-if="!item.isCompleted" type="button" class="btn btn-secondary btn-sm" @click="openContribute(item)">
            <vue-feather type="plus" size="14"></vue-feather>
            {{ $t('goalList.contributeModal.title') }}
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
import goalService from '@/services/goal.service';
import { formatMoney, formatDate } from '@/utils/format';
import { confirmDelete } from '@/utils/confirm';

export default {
  name: 'GoalList',
  components: { AppPagination, EmptyState, LabelChips },
  data() {
    return {
      loading: false,
      activeTab: 'Active',
      goals: [],
      metrics: null,
      total: 0,
      page: 1,
      pageSize: 12,
    };
  },
  computed: {
    tabs() {
      return [
        { key: 'Active', text: this.$t('goalList.tabs.active') },
        { key: 'Completed', text: this.$t('goalList.tabs.completed') },
        { key: 'All', text: this.$t('goalList.tabs.all') },
      ];
    },
    overallPct() {
      if (!this.metrics?.totalTargetAmount) return 0;
      return Math.min(100, (this.metrics.totalSavedAmount / this.metrics.totalTargetAmount) * 100);
    },
    version() {
      return this.$store.state.ui.versions.goals;
    },
  },
  watch: {
    page() { this.loadGoals(); },
    version() {
      this.loadGoals();
      this.loadMetrics();
    },
  },
  mounted() {
    this.loadGoals();
    this.loadMetrics();
  },
  methods: {
    money(v, code) {
      return formatMoney(v, code, { decimals: 2 });
    },
    metricMoney(v) {
      return formatMoney(v, this.metrics?.currency?.code);
    },
    pct(v) {
      if (v == null) return '0';
      return Number.isInteger(v) ? v : v.toFixed(1);
    },
    deadlineText(d) {
      const days = moment(d).startOf('day').diff(moment().startOf('day'), 'days');
      if (days < 0) return `${formatDate(d, 'D MMM YYYY')} · ${this.$t('goalExtra.overdue')}`;
      // Far deadlines read better as a date, near ones as a countdown.
      if (days > 60) return formatDate(d, 'D MMM YYYY');
      return this.$t('goalExtra.daysLeft', { n: days }, days);
    },
    selectTab(key) {
      if (this.activeTab === key) return;
      this.activeTab = key;
      if (this.page !== 1) this.page = 1;
      else this.loadGoals();
    },
    async loadGoals() {
      this.loading = true;
      const params = { PageNumber: this.page, PageSize: this.pageSize };
      if (this.activeTab === 'Active') params.IsCompleted = false;
      if (this.activeTab === 'Completed') params.IsCompleted = true;
      try {
        const response = await goalService.getAllGoals(params);
        if (response.status !== 200) throw new Error('load failed');
        this.total = response.data.data.totalRecords;
        this.goals = response.data.data.items || [];
      } catch {
        this.$toast.error(this.$t('goalList.messages.loadError'));
      } finally {
        this.loading = false;
      }
    },
    async loadMetrics() {
      try {
        const response = await goalService.getGoalMetrics();
        if (response.status === 200) this.metrics = response.data.data;
      } catch {
        this.$toast.error(this.$t('goalList.messages.metricsLoadError'));
      }
    },
    openCreate() {
      this.$store.dispatch('ui/openModal', { type: 'goal', mode: 'create' });
    },
    openEdit(item) {
      this.$store.dispatch('ui/openModal', { type: 'goal', mode: 'edit', data: item });
    },
    openContribute(item) {
      this.$store.dispatch('ui/openModal', { type: 'goalContribute', data: item });
    },
    async remove(item) {
      const ok = await confirmDelete(this.$t('goalList.messages.areYouSureDelete'));
      if (!ok) return;
      try {
        const response = await goalService.deleteGoal(item.id);
        if (response.status !== 200) throw new Error('delete failed');
        this.$toast.success(this.$t('goalList.messages.deleteSuccess'));
        this.$store.dispatch('ui/bump', 'goals');
      } catch {
        this.$toast.error(this.$t('goalList.messages.deleteError'));
      }
    },
  },
};
</script>

<style scoped>
.page-head {
  margin-bottom: 0;
}

.metrics {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
}

.metrics .stat + .stat {
  border-left: 1px solid var(--border);
}

.overall {
  margin-top: 6px;
  max-width: 360px;
}

@media (max-width: 767px) {
  .metrics {
    grid-template-columns: 1fr 1fr;
  }

  .metrics .stat:first-child {
    grid-column: 1 / -1;
    border-bottom: 1px solid var(--border);
  }

  .metrics .stat:nth-child(2) {
    border-left: 0;
  }
}

.is-loading {
  opacity: 0.55;
  transition: opacity 0.15s;
}

.saving-fill {
  background: var(--saving);
}

.done-fill {
  background: var(--income);
}

.goal-amounts {
  display: flex;
  align-items: baseline;
  gap: 6px;
  flex-wrap: wrap;
}

.goal-current {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.goal-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.goal-progress .progress {
  flex: 1;
}

.goal-pct {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--text-2);
  min-width: 40px;
  text-align: right;
}

.goal-remaining {
  font-size: 12.5px;
}

.tile.done {
  background: linear-gradient(180deg, var(--income-soft), var(--surface) 60%);
}
</style>
