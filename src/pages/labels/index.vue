<template>
  <div class="page">
    <div class="page-head">
      <div>
        <p class="page-subtitle labels-sub">{{ $t('labelExtra.subtitle') }}</p>
      </div>
      <div class="page-actions">
        <div class="input-wrap labels-search">
          <vue-feather type="search" size="16" class="input-icon"></vue-feather>
          <input v-model="search" class="input" type="search" :placeholder="$t('labelsPage.searchPlaceholder')" />
        </div>
        <button type="button" class="btn btn-primary hide-mobile" @click="openCreate">
          <vue-feather type="plus" size="16"></vue-feather>
          {{ $t('labelsPage.addButton') }}
        </button>
      </div>
    </div>

    <div v-if="loading && !labels.length" class="label-grid">
      <div v-for="i in 8" :key="i" class="skeleton" style="height: 64px; border-radius: 14px"></div>
    </div>

    <div v-else-if="!labels.length" class="card">
      <empty-state icon="tag" :title="$t('labelsPage.emptyTitle')" :text="$t('labelsPage.emptySub')">
        <button type="button" class="btn btn-primary btn-sm" @click="openCreate">
          <vue-feather type="plus" size="15"></vue-feather>
          {{ $t('labelsPage.addButton') }}
        </button>
      </empty-state>
    </div>

    <div v-else-if="!filtered.length" class="card">
      <empty-state icon="search" :title="$t('labelsPage.noSearchResults')" compact />
    </div>

    <div v-else class="label-grid">
      <button
        v-for="label in filtered"
        :key="label.id"
        type="button"
        class="label-card"
        :style="{ '--c': label.colorCode }"
        @click="openEdit(label)"
      >
        <span class="label-swatch">
          <vue-feather type="tag" size="15"></vue-feather>
        </span>
        <span class="label-name truncate">{{ label.name }}</span>
        <vue-feather type="edit-2" size="14" class="label-edit"></vue-feather>
      </button>

      <button type="button" class="label-card label-add" @click="openCreate">
        <vue-feather type="plus" size="16"></vue-feather>
        <span>{{ $t('labelsPage.addButton') }}</span>
      </button>
    </div>
  </div>
</template>

<script>
import EmptyState from '@/components/ui/EmptyState.vue';

export default {
  name: 'LabelsPage',
  components: { EmptyState },
  data() {
    return { search: '', loading: false };
  },
  computed: {
    labels() {
      return [...this.$store.getters['dashboard/getLabels']].sort((a, b) => a.name.localeCompare(b.name, this.$i18n.locale));
    },
    filtered() {
      const q = this.search.trim().toLocaleLowerCase(this.$i18n.locale);
      if (!q) return this.labels;
      return this.labels.filter((l) => l.name.toLocaleLowerCase(this.$i18n.locale).includes(q));
    },
  },
  async mounted() {
    this.loading = true;
    try {
      await this.$store.dispatch('dashboard/loadLabels', { force: true });
    } catch {
      this.$toast.error(this.$t('labelsPage.messages.loadError'));
    } finally {
      this.loading = false;
    }
  },
  methods: {
    openCreate() {
      this.$store.dispatch('ui/openModal', { type: 'label', mode: 'create' });
    },
    openEdit(label) {
      this.$store.dispatch('ui/openModal', { type: 'label', mode: 'edit', data: label });
    },
  },
};
</script>

<style scoped>
.labels-sub {
  margin-top: 0;
}

.labels-search {
  width: 260px;
}

@media (max-width: 767px) {
  .page-actions,
  .labels-search {
    width: 100%;
  }
}

.label-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 12px;
}

@media (max-width: 480px) {
  .label-grid {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
}

.label-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 64px;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--surface);
  color: var(--text);
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
  min-width: 0;
}

.label-card:hover {
  border-color: color-mix(in srgb, var(--c, var(--primary)) 50%, var(--border));
  box-shadow: var(--shadow-md);
}

.label-swatch {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: color-mix(in srgb, var(--c) 16%, transparent);
  color: var(--c);
}

.label-name {
  flex: 1;
  min-width: 0;
}

.label-edit {
  color: var(--text-3);
  opacity: 0;
  transition: opacity 0.15s;
}

.label-card:hover .label-edit {
  opacity: 1;
}

.label-add {
  justify-content: center;
  border-style: dashed;
  border-width: 1.5px;
  background: transparent;
  color: var(--text-3);
}

.label-add:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-soft);
  box-shadow: none;
}
</style>
