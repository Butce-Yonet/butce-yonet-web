<template>
  <div class="header-logo-wrapper col-auto p-0">
    <div class="logo-wrapper">
      <router-link to="/">
        <svg width="121" height="35" viewBox="0 0 121 35" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g id="icon-group">
            <rect x="0" y="18" width="6" height="10" rx="1" fill="#475569" />
            <rect x="8" y="12" width="6" height="16" rx="1" fill="#334155" />
            <rect x="16" y="4" width="6" height="24" rx="1" fill="#10b981" />

            <path d="M3 16 L11 10 L19 2" stroke="#10b981" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" />

            <circle cx="26" cy="4" r="3" fill="#34d399" />
          </g>

          <text x="32" y="23" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="15"
            font-weight="1000" fill="#1e293b" letter-spacing="-0.5">
            Bütçe
            <tspan font-weight="1000" fill="#059669">Yönet</tspan>
          </text>
        </svg>
      </router-link>
    </div>
    <div class="toggle-sidebar" @click="toggle_sidebar">
      <vue-feather class="status_toggle middle sidebar-toggle" type="align-center" id="sidebar-toggle"></vue-feather>
    </div>
  </div>

</template>

<script>
export default {
  name: 'Logo',
  methods: {
    toggle_sidebar() {
      this.$store.dispatch('menu/opensidebar');
    },
  },
};
</script>
