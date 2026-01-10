<template>
  <div>
    <div class="logo-wrapper">
      <Logo />
      <div class="back-btn" @click="toggle_sidebar">
        <i class="fa fa-angle-left"></i>
      </div>
      <div class="toggle-sidebar" @click="toggle_sidebar">
        <vue-feather class="status_toggle middle sidebar-toggle" type="grid" id="sidebar-toggle"></vue-feather>
      </div>
    </div>
    <div class="logo-icon-wrapper">
      <router-link to="/">
        <svg width="35" height="35" viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g id="icon-only-centered" transform="translate(2.5, 2.5)">
            <rect x="2" y="18" width="6" height="10" rx="1" fill="#475569" />
            <rect x="10" y="12" width="6" height="16" rx="1" fill="#334155" />
            <rect x="18" y="4" width="6" height="24" rx="1" fill="#10b981" />

            <path d="M5 16 L13 10 L21 2" stroke="#10b981" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" />

            <circle cx="28" cy="4" r="3" fill="#34d399" />
          </g>
        </svg></router-link>
    </div>
    <Nav />
  </div>
</template>
<script>
import { mapState } from 'vuex';
import Logo from './logo.vue';
import Nav from './nav.vue';

export default {
  name: 'Sidebar',
  components: {
    Logo,
    Nav,
  },
  computed: {
    ...mapState({
      menuItems: (state) => state.menu.data,
      activeoverlay: (state) => state.menu.activeoverlay,
    }),
  },
  methods: {
    toggle_sidebar() {
      this.$store.dispatch('menu/opensidebar');
      this.$store.state.menu.activeoverlay = false;
    },
  },
};
</script>
