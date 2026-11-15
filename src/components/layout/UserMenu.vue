<template>
  <div class="user-menu" v-click-outside="close">
    <button
      type="button"
      class="user-trigger"
      :class="{ full: !compact, open: isOpen }"
      :aria-expanded="isOpen"
      @click="isOpen = !isOpen"
    >
      <span class="avatar">{{ userInitials }}</span>
      <span v-if="!compact" class="user-info">
        <span class="user-name truncate">{{ user.name || user.preferred_username }}</span>
        <span class="user-sub truncate">{{ user.preferred_username }}</span>
      </span>
      <vue-feather v-if="!compact" type="chevron-up" size="15" class="user-caret"></vue-feather>
    </button>

    <transition name="pop">
      <div v-if="isOpen" class="menu user-dropdown" :class="placement">
        <div class="user-head">
          <span class="avatar lg">{{ userInitials }}</span>
          <div class="user-info">
            <div class="user-name truncate">{{ user.name || '—' }}</div>
            <div class="user-sub truncate">{{ user.preferred_username }}</div>
          </div>
        </div>
        <div class="menu-sep"></div>

        <router-link to="/profile" class="menu-item" @click="close">
          <vue-feather type="user" size="16"></vue-feather>
          <span class="menu-text">{{ $t('menu.profile') }}</span>
        </router-link>
        <router-link to="/profile?tab=notifications" class="menu-item" @click="close">
          <vue-feather type="bell" size="16"></vue-feather>
          <span class="menu-text">{{ $t('profile.tabs.notifications') }}</span>
        </router-link>

        <div class="menu-sep"></div>

        <button type="button" class="menu-item danger" @click="logout">
          <vue-feather type="log-out" size="16"></vue-feather>
          <span class="menu-text">{{ $t('common.logout') }}</span>
        </button>
      </div>
    </transition>
  </div>
</template>

<script>
import authService from '@/services/auth.service';
import { initials } from '@/utils/format';

export default {
  name: 'UserMenu',
  props: {
    compact: { type: Boolean, default: false },
    placement: { type: String, default: 'up' },
  },
  data() {
    return {
      isOpen: false,
    };
  },
  computed: {
    user() {
      return this.$store.getters['user/getCurrentUser'] || {};
    },
    userInitials() {
      return initials(this.user.name || this.user.preferred_username);
    },
  },
  methods: {
    close() {
      this.isOpen = false;
    },
    logout() {
      authService.logout();
    },
  },
};
</script>

<style scoped>
.user-menu {
  position: relative;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px;
  border: 1px solid transparent;
  border-radius: 12px;
  background: transparent;
  color: var(--text);
  text-align: left;
  transition: background 0.15s, border-color 0.15s;
}

.user-trigger.full {
  width: 100%;
  padding: 8px;
}

.user-trigger:hover,
.user-trigger.open {
  background: var(--surface-3);
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: linear-gradient(135deg, #1e293b, #059669);
  color: #fff;
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.avatar.lg {
  width: 40px;
  height: 40px;
  font-size: 14px;
}

.user-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.user-name {
  font-size: 13.5px;
  font-weight: 600;
  line-height: 1.3;
}

.user-sub {
  font-size: 12px;
  color: var(--text-3);
  line-height: 1.3;
}

.user-caret {
  color: var(--text-3);
}

.user-dropdown {
  width: 270px;
}

.user-dropdown.up {
  bottom: calc(100% + 8px);
  left: 0;
}

.user-dropdown.down {
  top: calc(100% + 8px);
  right: 0;
}

.user-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
}

</style>
