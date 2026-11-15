<template>
  <div class="page">
    <subscription-list />
  </div>
</template>

<script>
import SubscriptionList from '@/components/subscription/subscriptionList.vue';

export default {
  name: 'SubscriptionsPage',
  components: { SubscriptionList },
};
</script>
