<template>
  <li class="profile-nav onhover-dropdown pe-0 py-0">
    <div class="media profile-media">
      <svg class="m-t-5" width="45" height="45" viewBox="0 0 34 35" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="avatar_grad_35px" x1="0" y1="0" x2="35" y2="35" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#0f172a" />
            <stop offset="100%" stop-color="#10b981" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="35" height="35" rx="8" fill="url(#avatar_grad_35px)" />

        <g fill="white">
          <circle cx="17.5" cy="11.5" r="5.5" />
          <path
            d="M17.5 19C12.2 19 7.5 21.8 5.5 26.5C6.5 29.8 9.5 32 17.5 32C25.5 32 28.5 29.8 29.5 26.5C27.5 21.8 22.8 19 17.5 19Z" />
        </g>
      </svg>
      <div class="media-body">
        <span>{{ currentUser.name }}</span>
        <p class="mb-0 font-roboto">
          {{ currentUser.preferred_username }} <i class="middle fa fa-angle-down"></i>
        </p>
      </div>
    </div>
    <ul class="profile-dropdown onhover-show-div">
      <li @click="logout">
        <vue-feather type="log-in"></vue-feather><span>{{ $t('common.logout') }}</span>
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
      return this.$store.getters['user/getCurrentUser']
    }
  },
  methods: {
    logout: function () {
      authService.logout();
    }
  },
};
</script>
