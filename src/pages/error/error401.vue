<template>
  <error-view code="401" :title="$t('errorPage.authFailedTitle')" :text="$t('errorPage.authFailedText')">
    <button type="button" class="btn btn-primary btn-lg" @click="login">
      <vue-feather type="log-in" size="16"></vue-feather>
      {{ $t('errorPage.tryAgain') }}
    </button>
  </error-view>
</template>

<script>
import ErrorView from './ErrorView.vue';
import authService from '@/services/auth.service';

export default {
  name: 'Error401',
  components: { ErrorView },
  methods: {
    login() {
      authService.redirectToLogin();
    },
  },
};
</script>
