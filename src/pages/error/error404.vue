<template>
  <error-view code="404" :title="$t('errorPage.notFoundTitle')" :text="$t('errorPage.notFoundText')" />
</template>

<script>
import ErrorView from './ErrorView.vue';

export default {
  name: 'Error404',
  components: { ErrorView },
};
</script>
