<template>
  <aside class="sidebar">
    <div class="sidebar-top">
      <brand-logo />
    </div>

    <nav class="sidebar-nav" :aria-label="$t('menu.main')">
      <router-link
        v-for="item in items"
        :key="item.name"
        :to="item.path"
        class="nav-link"
        :class="{ active: isActive(item) }"
      >
        <vue-feather :type="item.icon" size="18"></vue-feather>
        <span>{{ $t(item.title) }}</span>
      </router-link>
    </nav>

    <div class="sidebar-bottom">
      <user-menu placement="up" />
    </div>
  </aside>
</template>

<script>
import BrandLogo from './BrandLogo.vue';
import UserMenu from './UserMenu.vue';
import { navItems } from '@/constants/navigation';

export default {
  name: 'AppSidebar',
  components: { BrandLogo, UserMenu },
  data() {
    return { items: navItems };
  },
  methods: {
    isActive(item) {
      if (item.path === '/') return this.$route.path === '/';
      return this.$route.path.startsWith(item.path);
    },
  },
};
</script>

<style scoped>
.sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  width: var(--sidebar-w);
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border-right: 1px solid var(--border);
  z-index: 40;
}

.sidebar-top {
  height: var(--topbar-h);
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px;
  overflow-y: auto;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 40px;
  padding: 0 12px;
  border-radius: 10px;
  color: var(--text-2);
  font-size: 14px;
  font-weight: 550;
  transition: background 0.15s, color 0.15s;
}

.nav-link:hover {
  background: var(--surface-3);
  color: var(--text);
}

.nav-link.active {
  background: var(--primary-soft);
  color: var(--primary);
  font-weight: 650;
}

.sidebar-bottom {
  padding: 12px;
  border-top: 1px solid var(--border);
}

@media (max-width: 1023px) {
  .sidebar {
    display: none;
  }
}
</style>
