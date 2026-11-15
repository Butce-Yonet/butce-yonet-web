<template>
  <div class="page">
    <div class="stack">
      <div v-if="summary.length" class="card">
        <budget-summary :items="summary" />
      </div>

      <div class="page-head">
        <div v-if="currencies.length > 1" class="segmented">
          <button type="button" :class="{ active: currencyId === null }" @click="currencyId = null">{{ $t('common.all') }}</button>
          <button
            v-for="c in currencies"
            :key="c.id"
            type="button"
            :class="{ active: currencyId === c.id }"
            @click="currencyId = c.id"
          >{{ c.code }}</button>
        </div>
        <span v-else></span>
        <button type="button" class="btn btn-primary" @click="openCreate">
          <vue-feather type="plus" size="16"></vue-feather>
          {{ $t('budgets.addButton') }}
        </button>
      </div>

      <div v-if="loading && !loaded" class="tile-grid">
        <div v-for="i in 3" :key="i" class="tile" style="min-height: 190px">
          <div class="skeleton" style="height: 14px; width: 60%"></div>
          <div class="skeleton" style="height: 8px; width: 100%; margin-top: 24px"></div>
          <div class="skeleton" style="height: 10px; width: 40%"></div>
        </div>
      </div>

      <div v-else-if="loadError" class="card">
        <empty-state icon="wifi-off" :title="$t('budgets.errors.loadTitle')" :text="loadError">
          <button type="button" class="btn btn-secondary btn-sm" @click="load">
            <vue-feather type="refresh-cw" size="14"></vue-feather>
            {{ $t('budgets.retry') }}
          </button>
        </empty-state>
      </div>

      <div v-else-if="!budgets.length" class="card">
        <empty-state icon="sliders" :title="$t('budgets.emptyTitle')" :text="$t('budgets.emptyText')">
          <button type="button" class="btn btn-primary btn-sm" @click="openCreate">
            <vue-feather type="plus" size="15"></vue-feather>
            {{ $t('budgets.createButton') }}
          </button>
        </empty-state>
      </div>

      <template v-else>
        <div class="tile-grid" :class="{ 'is-loading': loading }">
          <budget-card
            v-for="b in visible"
            :key="b.id"
            :budget="b"
            :to="{ name: 'budget-detail', params: { id: b.id } }"
            @edit="openEdit"
            @delete="remove"
          />
        </div>
        <p class="limit-note">
          <vue-feather type="info" size="14"></vue-feather>
          {{ $t('budgets.limitations.labeledOnly') }}
        </p>
      </template>
    </div>
  </div>
</template>

<script>
import BudgetCard from '@/components/budget/budgetCard.vue';
import BudgetSummary from '@/components/budget/budgetSummary.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import budgetService from '@/services/budget.service';
import { confirmDelete } from '@/utils/confirm';
import { budgetErrorText } from '@/utils/budgetErrors';

export default {
  name: 'BudgetsPage',
  components: { BudgetCard, BudgetSummary, EmptyState },
  data() {
    return {
      budgets: [],
      summary: [],
      loading: false,
      loaded: false,
      loadError: '',
      currencyId: null,
    };
  },
  computed: {
    // Currencies that actually have budgets, in summary (rank) order.
    currencies() {
      return this.summary.map((s) => s.currency);
    },
    // Keeps the server order (general first, then fullest).
    visible() {
      if (this.currencyId === null) return this.budgets;
      return this.budgets.filter((b) => b.currency?.id === this.currencyId);
    },
    version() {
      return this.$store.state.ui.versions.budgets;
    },
  },
  watch: {
    version() {
      this.load();
    },
    currencies(list) {
      if (this.currencyId !== null && !list.some((c) => c.id === this.currencyId)) this.currencyId = null;
    },
  },
  mounted() {
    this.load();
  },
  methods: {
    async load() {
      this.loading = true;
      try {
        const [budgets, summary] = await Promise.all([budgetService.list(), budgetService.summary()]);
        this.budgets = budgets || [];
        this.summary = summary || [];
        this.loadError = '';
      } catch (err) {
        if (err?.kind === 'unauthorized') return;
        this.loadError = budgetErrorText(err);
      } finally {
        this.loading = false;
        this.loaded = true;
      }
    },
    openCreate() {
      this.$store.dispatch('ui/openModal', {
        type: 'budget',
        mode: 'create',
        data: this.currencyId !== null ? { currencyId: this.currencyId } : null,
      });
    },
    openEdit(b) {
      this.$store.dispatch('ui/openModal', { type: 'budget', mode: 'edit', data: b });
    },
    async remove(b) {
      const name = b.isGeneral ? this.$t('budgets.general') : b.label?.name;
      const ok = await confirmDelete(this.$t('budgets.messages.areYouSureDelete', { name }));
      if (!ok) return;
      try {
        await budgetService.remove(b.id);
        this.$toast.success(this.$t('budgets.messages.deleteSuccess'));
      } catch (err) {
        // Already gone: just refresh the list.
        if (err?.kind !== 'notFound') this.$toast.error(budgetErrorText(err));
      }
      this.$store.dispatch('ui/bump', 'budgets');
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

.limit-note {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: var(--text-3);
}
</style>
