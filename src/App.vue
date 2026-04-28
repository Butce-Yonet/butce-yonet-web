<template>
  <router-view />
  <consent-modal />
</template>

<script>
import ConsentModal from '@/components/consent/consentModal.vue';

export default {
  components: { 'consent-modal': ConsentModal },
};
</script>
