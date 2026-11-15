<template>
  <header class="topbar">
    <div class="topbar-mobile-brand">
      <brand-logo compact />
    </div>

    <div class="topbar-title">
      <h1 class="truncate">{{ title }}</h1>
    </div>

    <div class="topbar-actions">
      <preference-menus />
      <div class="hide-on-tablet">
        <quick-add-menu />
      </div>
      <div class="show-on-tablet">
        <user-menu compact placement="down" />
      </div>
    </div>
  </header>
</template>

<script>
import BrandLogo from './BrandLogo.vue';
import QuickAddMenu from './QuickAddMenu.vue';
import UserMenu from './UserMenu.vue';
import PreferenceMenus from './PreferenceMenus.vue';

export default {
  name: 'AppTopbar',
  components: { BrandLogo, QuickAddMenu, UserMenu, PreferenceMenus },
  computed: {
    title() {
      const key = this.$route.meta?.title;
      return key ? this.$t(key) : '';
    },
  },
};
</script>

<style scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 30;
  height: var(--topbar-h);
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 28px;
  background: color-mix(in srgb, var(--bg) 82%, transparent);
  backdrop-filter: saturate(160%) blur(10px);
  -webkit-backdrop-filter: saturate(160%) blur(10px);
  border-bottom: 1px solid var(--border);
}

.topbar-title {
  flex: 1;
  min-width: 0;
}

.topbar-title h1 {
  font-size: 17px;
  font-weight: 650;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.topbar-mobile-brand,
.show-on-tablet {
  display: none;
}

@media (max-width: 1023px) {
  .topbar {
    padding: 0 16px;
    gap: 12px;
  }

  .topbar-mobile-brand,
  .show-on-tablet {
    display: flex;
  }

  .hide-on-tablet {
    display: none;
  }
}
</style>
