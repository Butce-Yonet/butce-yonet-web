<template>
  <li class="profile-nav onhover-dropdown pe-0 py-0">
    <div class="media profile-media">
      <img class="b-r-10" src="@/assets/images/dashboard/profile.png" alt="" />
      <div class="media-body">
        <span>{{ currentUser.name }}</span>
        <p class="mb-0 font-roboto">
          {{ currentUser.preferred_username }} <i class="middle fa fa-angle-down"></i>
        </p>
      </div>
    </div>
    <ul class="profile-dropdown onhover-show-div">
      <li @click="logout">
        <vue-feather type="log-in"></vue-feather><span>Log out</span>
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
