<template>
  <div class="container-fluid pt-4">
    <!-- Mobile notebook selector -->
    <div class="d-flex d-md-none mb-3">
      <notebook-selector></notebook-selector>
    </div>

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

    <create-notebook></create-notebook>
    <edit-notebook-detail></edit-notebook-detail>
  </div>
</template>

<script>
import createNotebookComponent from '@/components/notebook/createNotebook.vue';
import editNotebookDetailComponent from '@/components/notebook/editNotebookDetail.vue';
import NotebookSelector from '@/components/header/notebookSelector.vue';
import periodSummaryReport from '@/components/reports/periodSummaryReport.vue';
import categorySpendingReport from '@/components/reports/categorySpendingReport.vue';
import detailedReport from '@/components/reports/detailedReport.vue';
import * as bootstrap from 'bootstrap';
import currencyService from '@/services/currency.service';
import notebookLabelService from '@/services/notebook.label.service';

export default {
  components: {
    'create-notebook': createNotebookComponent,
    'edit-notebook-detail': editNotebookDetailComponent,
    'notebook-selector': NotebookSelector,
    'period-summary-report': periodSummaryReport,
    'category-spending-report': categorySpendingReport,
    'detailed-report': detailedReport,
  },
  data() {
    return {
      modal: {},
      detailModal: {},
    };
  },
  watch: {
    '$store.state.notebook.createNotebookModalVisible'(newVal) {
      if (newVal) {
        this.modal.show();
      } else {
        this.modal.hide();
      }
    },
    '$store.state.notebook.editNotebookDetailModalVisible'(newVal) {
      if (newVal) {
        this.detailModal.show();
      } else {
        this.detailModal.hide();
      }
    },
    '$store.state.notebook.selectedNotebook': {
      deep: true,
      immediate: true,
      async handler(newVal) {
        if (!newVal?.id) return;
        await this.getCurrencies();
        await this.getNotebookLabels();
      },
    },
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
        const response = await notebookLabelService.getNotebookLabels(
          this.$store.getters['notebook/getSelectedNotebook'].id
        );
        this.$store.dispatch('dashboard/setLabels', response.data.data);
      } catch {
        this.$swal({ icon: 'error', title: this.$t('common.messages.notebookLabelsLoadError') });
      }
    },
  },
  mounted() {
    const modalElement = document.getElementById('createNotebookModal');
    if (modalElement) {
      this.modal = new bootstrap.Modal(modalElement, { backdrop: 'static', keyboard: false });
    }

    const detailModalElement = document.getElementById('editNotebookDetailModal');
    if (detailModalElement) {
      this.detailModal = new bootstrap.Modal(detailModalElement, { backdrop: 'static', keyboard: false });
    }
  },
};
</script>
