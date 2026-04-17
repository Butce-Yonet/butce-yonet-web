<template>
  <div class="header-wrapper row m-0">
    <Logo />
    <div class="left-header col-xxl-5 col-xl-6 col-lg-5 col-md-4 p-0 d-none d-md-flex align-items-center">
      <div v-if="selectedNotebook" class="active-notebook-chip">
        <div class="notebook-chip-icon">
          <i class="fa fa-book"></i>
        </div>
        <div class="notebook-chip-text">
          <span class="notebook-chip-label d-none d-lg-block">{{ $t('header.activeNotebook') }}</span>
          <span class="notebook-chip-name">{{ selectedNotebook.name }}</span>
        </div>
      </div>
    </div>
    <div class="nav-right col-xxl-7 col-xl-6 col-md-7 col-8 pull-right right-header p-0 ms-auto">
      <ul class="nav-menus">
        <Language />
        <Profile />
      </ul>
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import Profile from './profile';
import Logo from './logo.vue';
import Language from './language.vue';

export default {
  components: {
    Profile,
    Logo,
    Language
  },
  computed: {
    ...mapState({
      menuItems: (state) => state.menu.searchData,
      megamenuItems: (state) => state.menu.megamenu,
      selectedNotebook: (state) => state.notebook.selectedNotebook
    }),
  },
};
</script>

<style scoped>
.active-notebook-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border: 1.5px solid #6ee7b7;
  border-radius: 10px;
  padding: 5px 10px 5px 6px;
  max-width: 100%;
  overflow: hidden;
}

.notebook-chip-icon {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  background: linear-gradient(135deg, #10b981, #059669);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  flex-shrink: 0;
}

.notebook-chip-text {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.notebook-chip-label {
  font-size: 10px;
  font-weight: 600;
  color: #059669;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  line-height: 1.2;
}

.notebook-chip-name {
  font-size: 13px;
  font-weight: 700;
  color: #065f46;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}
</style>
