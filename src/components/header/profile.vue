<template>
  <li class="profile-nav onhover-dropdown pe-0 py-0">
    <div class="media profile-media">
      <img class="b-r-10" src="../../../avatar.png" alt="" style="max-width: 35px; min-height: 35px;"/>
      <div class="media-body">
      </div>
    </div>
    <ul class="profile-dropdown onhover-show-div">
      <li @click="logout">
        <vue-feather type="log-in"></vue-feather><span>{{ $t('logout') }}</span>
      </li>
    </ul>
  </li>
</template>

<script>
import authClient from '@/services/authClient';
export default {
  name: 'Profile',
  methods: {
    logout: function () {
      authClient.logout();
    }
  },
};
</script>
