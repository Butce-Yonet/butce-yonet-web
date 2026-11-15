<template>
  <router-view />
  <consent-modal />
  <toast-host />
</template>

<script>
import ConsentModal from '@/components/consent/consentModal.vue';
import ToastHost from '@/components/ui/ToastHost.vue';

export default {
  name: 'App',
  components: { ConsentModal, ToastHost },
};
</script>
