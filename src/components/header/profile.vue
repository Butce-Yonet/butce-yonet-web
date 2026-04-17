<template>
  <li class="profile-nav onhover-dropdown pe-0 py-0">
    <div class="media profile-media">
      <div class="avatar-wrap">
        <span class="avatar-initials">{{ initials }}</span>
        <span class="avatar-online-dot"></span>
      </div>
      <div class="media-body ms-2">
        <span class="profile-name">{{ currentUser.name }}</span>
        <p class="mb-0 profile-sub">
          {{ currentUser.preferred_username }}
          <i class="fa fa-angle-down ms-1"></i>
        </p>
      </div>
    </div>

    <ul class="profile-dropdown onhover-show-div">
      <li class="dropdown-header">
        <div class="dropdown-avatar">
          <span>{{ initials }}</span>
        </div>
        <div class="dropdown-user-info">
          <div class="dropdown-name">{{ currentUser.name }}</div>
          <div class="dropdown-username">{{ currentUser.preferred_username }}</div>
        </div>
      </li>
      <li class="dropdown-divider"></li>
      <li class="dropdown-item-li" @click="logout">
        <i class="fa fa-sign-out me-2"></i>
        <span>{{ $t('common.logout') }}</span>
      </li>
    </ul>
  </li>
</template>

<script>
import authService from '@/services/auth.service';
export default {
  name: 'Profile',
  computed: {
    currentUser() {
      return this.$store.getters['user/getCurrentUser'];
    },
    initials() {
      const name = this.currentUser?.name || '';
      const parts = name.trim().split(' ');
      if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      return name.slice(0, 2).toUpperCase();
    }
  },
  methods: {
    logout() {
      authService.logout();
    }
  },
};
</script>

<style scoped>
/* Avatar */
.avatar-wrap {
  position: relative;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.avatar-initials {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #0f172a, #10b981);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.avatar-online-dot {
  position: absolute;
  bottom: 1px;
  right: 1px;
  width: 10px;
  height: 10px;
  background: #10b981;
  border: 2px solid #fff;
  border-radius: 50%;
}

/* Trigger text */
.profile-name {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.3;
}

.profile-sub {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.2;
}

/* Dropdown panel */
:deep(.profile-dropdown) {
  min-width: 220px !important;
  border-radius: 14px !important;
  border: 1px solid #e5e7eb !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1) !important;
  padding: 6px 0 !important;
  overflow: hidden;
}

.dropdown-header {
  display: flex !important;
  align-items: center;
  gap: 12px;
  padding: 14px 16px 12px !important;
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  cursor: default !important;
}

.dropdown-avatar {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: linear-gradient(135deg, #0f172a, #10b981);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  flex-shrink: 0;
}

.dropdown-user-info {
  overflow: hidden;
}

.dropdown-name {
  font-size: 14px;
  font-weight: 700;
  color: #065f46;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-username {
  font-size: 12px;
  color: #059669;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 4px 0;
  padding: 0 !important;
  cursor: default !important;
}

.dropdown-item-li {
  display: flex;
  align-items: center;
  padding: 10px 16px !important;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: background 0.15s;
}

.dropdown-item-li:hover {
  background: #fef2f2;
  color: #dc2626;
}

.dropdown-item-li i {
  font-size: 14px;
}
</style>
