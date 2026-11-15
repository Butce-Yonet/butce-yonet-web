<template>
  <nav class="mobile-nav" :aria-label="$t('menu.main')">
    <router-link
      v-for="item in primary.slice(0, 2)"
      :key="item.name"
      :to="item.path"
      class="m-link"
      :class="{ active: isActive(item) }"
    >
      <vue-feather :type="item.icon" size="20"></vue-feather>
      <span>{{ $t(item.title) }}</span>
    </router-link>

    <div class="m-fab-slot">
      <button type="button" class="m-fab" :aria-label="$t('quickAdd.title')" @click="sheet = 'add'">
        <vue-feather type="plus" size="24"></vue-feather>
      </button>
    </div>

    <router-link
      v-for="item in primary.slice(2)"
      :key="item.name"
      :to="item.path"
      class="m-link"
      :class="{ active: isActive(item) }"
    >
      <vue-feather :type="item.icon" size="20"></vue-feather>
      <span>{{ $t(item.title) }}</span>
    </router-link>

    <button type="button" class="m-link" :class="{ active: moreActive }" @click="sheet = 'more'">
      <vue-feather type="grid" size="20"></vue-feather>
      <span>{{ $t('menu.more') }}</span>
    </button>

    <app-modal :open="sheet === 'add'" :title="$t('quickAdd.title')" size="sm" @close="sheet = null">
      <quick-action-list @select="openAction" />
    </app-modal>

    <app-modal :open="sheet === 'more'" :title="$t('menu.more')" size="sm" @close="sheet = null">
      <div class="more-grid">
        <router-link
          v-for="item in secondary"
          :key="item.name"
          :to="item.path"
          class="more-item"
          :class="{ active: isActive(item) }"
          @click="sheet = null"
        >
          <span class="more-icon"><vue-feather :type="item.icon" size="20"></vue-feather></span>
          <span>{{ $t(item.title) }}</span>
        </router-link>
      </div>
    </app-modal>
  </nav>
</template>

<script>
import AppModal from '@/components/ui/AppModal.vue';
import QuickActionList from './QuickActionList.vue';
import { navItems } from '@/constants/navigation';

export default {
  name: 'MobileNav',
  components: { AppModal, QuickActionList },
  data() {
    return { sheet: null };
  },
  computed: {
    primary() {
      return navItems.filter((i) => i.mobile);
    },
    secondary() {
      return navItems.filter((i) => !i.mobile);
    },
    moreActive() {
      return this.secondary.some((i) => this.isActive(i));
    },
  },
  methods: {
    isActive(item) {
      if (item.path === '/') return this.$route.path === '/';
      return this.$route.path.startsWith(item.path);
    },
    openAction(type) {
      this.sheet = null;
      this.$store.dispatch('ui/openModal', { type, mode: 'create' });
    },
  },
};
</script>

<style scoped>
.mobile-nav {
  display: none;
}

@media (max-width: 1023px) {
  .mobile-nav {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 50;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    align-items: center;
    height: calc(var(--mobile-nav-h) + env(safe-area-inset-bottom));
    padding: 0 6px env(safe-area-inset-bottom);
    background: color-mix(in srgb, var(--surface) 92%, transparent);
    backdrop-filter: saturate(160%) blur(12px);
    -webkit-backdrop-filter: saturate(160%) blur(12px);
    border-top: 1px solid var(--border);
  }
}

.m-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  height: 100%;
  border: 0;
  background: transparent;
  color: var(--text-3);
  font-size: 10.5px;
  font-weight: 600;
  text-decoration: none;
  min-width: 0;
}

.m-link span {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.m-link.active {
  color: var(--primary);
}

.m-fab-slot {
  display: flex;
  justify-content: center;
}

.m-fab {
  width: 52px;
  height: 52px;
  margin-top: -22px;
  border: 4px solid var(--bg);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #10b981, #047857);
  color: #fff;
  box-shadow: 0 8px 20px -4px rgba(5, 150, 105, 0.55);
  transition: transform 0.15s;
}

.m-fab:active {
  transform: scale(0.94);
}

.more-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.more-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text);
  font-weight: 600;
  font-size: 14px;
}

.more-item.active {
  border-color: var(--primary);
  background: var(--primary-soft);
  color: var(--primary);
}

.more-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-3);
  color: var(--text-2);
}

.more-item.active .more-icon {
  background: var(--surface);
  color: var(--primary);
}
</style>
