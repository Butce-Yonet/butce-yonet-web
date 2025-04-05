<template>
  <div class="header-wrapper row m-0">
    <Logo />
    <div class="left-header col-xxl-5 col-xl-6 col-lg-5 col-md-4 col-sm-3 p-0">
    </div>
    <div class="nav-right col-xxl-7 col-xl-6 col-md-7 col-8 pull-right right-header p-0 ms-auto">
      <ul class="nav-menus">
        <li>
          <Mode />
        </li>
        <Language />
        <Profile />
      </ul>
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import "swiper/css";
import Mode from './mode';
import Profile from './profile';
import Logo from './logo.vue';
import Language from './language.vue';

export default {
  components: {
    Mode,
    Profile,
    Logo,
    Language
  },
  data() {
    return {
      bookmark: false,
    };
  },
  computed: {
    ...mapState({
      menuItems: (state) => state.menu.searchData,
      megamenuItems: (state) => state.menu.megamenu,
    }),
  },
};
</script>
