<template>
  <div class="header-wrapper row m-0">
    <Logo />
    <div class="nav-right col pull-right right-header p-0 ms-auto">
      <ul class="nav-menus">
        <NotebookSelector class="d-none d-md-flex" />
        <AddTransactionButton />
        <Language />
        <Profile />
      </ul>
    </div>
  </div>
</template>

<script>
import notebookService from '@/services/notebook.service';
import Logo from './logo.vue';
import NotebookSelector from './notebookSelector.vue';
import AddTransactionButton from './addTransactionButton.vue';
import Language from './language.vue';
import Profile from './profile';

export default {
  components: {
    Logo,
    NotebookSelector,
    AddTransactionButton,
    Language,
    Profile,
  },
  created() {
    notebookService.loadNotebooks();
  },
};
</script>

