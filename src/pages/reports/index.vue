<template>
  <div class="page">
    <div class="filter-bar">
      <period-picker v-model="range" />
      <div class="cur-filter">
        <currency-select v-model="currencyId" clearable show-name :placeholder="$t('reportsExtra.defaultCurrency')" />
      </div>
    </div>

    <div class="stack">
      <period-summary-report :range="range" :currency-id="currencyId" />

      <div class="grid reports-grid">
        <category-spending-report :range="range" :currency-id="currencyId" />
        <detailed-report :range="range" :currency-id="currencyId" />
      </div>
    </div>
  </div>
</template>

<script>
import PeriodPicker from '@/components/ui/PeriodPicker.vue';
import CurrencySelect from '@/components/ui/CurrencySelect.vue';
import PeriodSummaryReport from '@/components/reports/periodSummaryReport.vue';
import CategorySpendingReport from '@/components/reports/categorySpendingReport.vue';
import DetailedReport from '@/components/reports/detailedReport.vue';
import { getDefaultDateRange } from '@/composables/dateRangePresets';

export default {
  name: 'ReportsPage',
  components: { PeriodPicker, CurrencySelect, PeriodSummaryReport, CategorySpendingReport, DetailedReport },
  data() {
    return { range: getDefaultDateRange(), currencyId: null };
  },
};
</script>

<style scoped>
.filter-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.cur-filter {
  width: 240px;
}

.reports-grid {
  grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
  align-items: start;
}

@media (max-width: 1100px) {
  .reports-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 600px) {
  .cur-filter {
    flex: 1;
    width: auto;
  }
}
</style>
