<template>
  <div class="container-fluid pt-4">
    <div class="row">
      <div class="col-12">
        <period-summary-report></period-summary-report>
      </div>
    </div>
    <div class="row mt-3">
      <div class="col-12 col-xl-5 mb-3 mb-xl-0">
        <category-spending-report></category-spending-report>
      </div>
      <div class="col-12 col-xl-7">
        <detailed-report></detailed-report>
      </div>
    </div>
  </div>
</template>

<script>
import periodSummaryReport from '@/components/reports/periodSummaryReport.vue';
import categorySpendingReport from '@/components/reports/categorySpendingReport.vue';
import detailedReport from '@/components/reports/detailedReport.vue';
import currencyService from '@/services/currency.service';
import userLabelService from '@/services/user.label.service';

export default {
  components: {
    'period-summary-report': periodSummaryReport,
    'category-spending-report': categorySpendingReport,
    'detailed-report': detailedReport,
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
