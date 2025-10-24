<template>
  <div class="header-logo-wrapper col-auto p-0">
    <div class="logo-wrapper">
      <router-link to="/">
        <img class="img-fluid" src="../../../logo.png" alt />
      </router-link>
    </div>
    <div class="toggle-sidebar" @click="toggle_sidebar">
      <vue-feather
        class="status_toggle middle sidebar-toggle"
        type="align-center"
        id="sidebar-toggle"
      ></vue-feather>
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
