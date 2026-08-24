<template>
  <div class="header-wrapper row m-0">
    <Logo />
    <div class="nav-right col pull-right right-header p-0 ms-auto">
      <ul class="nav-menus">
        <AddTransactionButton />
        <Language />
        <Profile />
      </ul>
    </div>
  </div>
</template>

<script>
import Logo from './logo.vue';
import AddTransactionButton from './addTransactionButton.vue';
import Language from './language.vue';
import Profile from './profile';

export default {
  components: {
    Logo,
    AddTransactionButton,
    Language,
    Profile,
  },
};
</script>

