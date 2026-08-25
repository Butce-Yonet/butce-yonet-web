<template>
  <div class="container-fluid pt-4">
    <subscription-list></subscription-list>
  </div>
</template>

<script>
import subscriptionList from '@/components/subscription/subscriptionList.vue';
import currencyService from '@/services/currency.service';
import userLabelService from '@/services/user.label.service';

export default {
  components: {
    'subscription-list': subscriptionList,
  },
  methods: {
    async getCurrencies() {
      try {
        const response = await currencyService.getCurrencies();
        this.$store.dispatch('dashboard/setCurrencies', response.data);
      } catch {
        this.$swal({ icon: 'error', title: this.$t('common.messages.currenciesLoadError') });
      }
    },
    async getNotebookLabels() {
      try {
        const response = await userLabelService.getUserLabels();
        this.$store.dispatch('dashboard/setLabels', response.data.data);
      } catch {
        this.$swal({ icon: 'error', title: this.$t('common.messages.notebookLabelsLoadError') });
      }
    },
  },
  async mounted() {
    await this.getCurrencies();
    await this.getNotebookLabels();
  },
};
</script>
