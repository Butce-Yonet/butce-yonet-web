<template>
  <div class="container-fluid pt-4">
    <!-- Mobile notebook indicator -->
    <div v-if="selectedNotebook" class="d-flex d-md-none align-items-center gap-2 mobile-notebook-bar mb-3">
      <div class="mobile-notebook-icon"><i class="fa fa-book"></i></div>
      <div class="mobile-notebook-info">
        <span class="mobile-notebook-label">{{ $t('header.activeNotebook') }}</span>
        <span class="mobile-notebook-name">{{ selectedNotebook.name }}</span>
      </div>
    </div>

    <!-- Tab bar -->
    <div class="dashboard-tabs mb-3">
      <button class="dash-tab" :class="{ active: activeTab === 'transactions' }" @click="activeTab = 'transactions'">
        <i class="fa fa-exchange me-2"></i>{{ $t('dashboard.tabs.transactions') }}
      </button>
      <button class="dash-tab" :class="{ active: activeTab === 'reports' }" @click="activeTab = 'reports'">
        <i class="fa fa-chart-bar me-2"></i>{{ $t('dashboard.tabs.reports') }}
      </button>
    </div>

    <!-- Transactions tab -->
    <template v-if="activeTab === 'transactions'">
      <div class="row">
        <div class="col-12">
          <transaction-list></transaction-list>
        </div>
      </div>
      <div class="row mt-3">
        <div class="col-sm-12 col-md-8">
          <recurring-transaction-list></recurring-transaction-list>
        </div>
      </div>
    </template>

    <!-- Reports tab — v-if ensures components never mount until first visit,
         v-show keeps them alive after that so data isn't re-fetched on tab switch -->
    <template v-if="reportsVisited">
      <div v-show="activeTab === 'reports'">
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

    <create-notebook></create-notebook>
    <edit-notebook-detail></edit-notebook-detail>
  </div>
</template>

<script>
import createNotebookComponent from '@/components/notebook/createNotebook.vue';
import editNotebookDetailComponent from '@/components/notebook/editNotebookDetail.vue';
import transactionList from '@/components/transaction/transactionList.vue';
import recurringTransactionList from '@/components/recurringtransaction/recurringTransactionList.vue';
import periodSummaryReport from '@/components/reports/periodSummaryReport.vue';
import categorySpendingReport from '@/components/reports/categorySpendingReport.vue';
import detailedReport from '@/components/reports/detailedReport.vue';
import * as bootstrap from 'bootstrap';

import { driver } from "driver.js";
import "driver.js/dist/driver.css";

import currencyService from '@/services/currency.service';
import notebookLabelService from '@/services/notebook.label.service';

export default {
  components: {
    'create-notebook': createNotebookComponent,
    'edit-notebook-detail': editNotebookDetailComponent,
    'transaction-list': transactionList,
    'recurring-transaction-list': recurringTransactionList,
    'period-summary-report': periodSummaryReport,
    'category-spending-report': categorySpendingReport,
    'detailed-report': detailedReport
  },
  computed: {
    selectedNotebook() {
      return this.$store.state.notebook.selectedNotebook;
    }
  },
  data() {
    return {
      activeTab: 'transactions',
      reportsVisited: false,
      modal: {},
      detailModal: {},
      tour: {}
    }
  },
  watch: {
    activeTab(val) {
      if (val === 'reports') this.reportsVisited = true;
    },
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
      async handler() {
        await this.getCurrencies();
        await this.getNotebookLabels();
      }
    }
  },
  methods: {
    async getCurrencies() {
      try {
        var response = await currencyService.getCurrencies();
        this.currencies = response.data;
        this.$store.dispatch('dashboard/setCurrencies', this.currencies);
      } catch (e) {
        this.$swal({
          icon: 'error',
          title: this.$t('common.messages.currenciesLoadError'),
        });
      }
    },
    async getNotebookLabels(){
      try {
        var response = await notebookLabelService.getNotebookLabels(this.$store.getters['notebook/getSelectedNotebook'].id);
        this.notebookLabels = response.data.data;
        this.$store.dispatch('dashboard/setLabels', this.notebookLabels);
      } catch (e) {
        this.$swal({
          icon: 'error',
          title: this.$t('common.messages.notebookLabelsLoadError'),
        });
      }
    }
  },
  mounted() {
    const modalElement = document.getElementById('createNotebookModal');
    if (modalElement) {
      this.modal = new bootstrap.Modal(modalElement, {
        backdrop: 'static',
        keyboard: false
      });
    }

    const detailModalElement = document.getElementById('editNotebookDetailModal');
    if (detailModalElement) {
      this.detailModal = new bootstrap.Modal(detailModalElement, {
        backdrop: 'static',
        keyboard: false
      });
    }

    this.tour = new driver({
      allowClose: true,
      showCloseButton: true,
      closeBtnText: this.$t('common.closeTour'),
      nextBtnText: this.$t('common.next'),
      prevBtnText: this.$t('common.previous'),
      doneBtnText: this.$t('common.done'),
      steps: [
        {
          element: '#sidebarCreateNotebookButton',
          popover:
          {
            title: this.$t('dashboardTour.step1.title'),
            description: this.$t('dashboardTour.step1.description')
          }
        },
        {
          element: '#sidebar-my-notebooks',
          popover:
          {
            title: this.$t('dashboardTour.step2.title'),
            description: this.$t('dashboardTour.step2.description')
          }
        },
        {
          element: '.sidebar-my-notebook-edit',
          popover:
          {
            title: this.$t('dashboardTour.step3.title'),
            description: this.$t('dashboardTour.step3.description')
          }
        },
        {
          element: '.sidebar-my-notebook-detail',
          popover:
          {
            title: this.$t('dashboardTour.step4.title'),
            description: this.$t('dashboardTour.step4.description')
          }
        },
        {
          element: '.sidebar-my-notebook-delete',
          popover:
          {
            title: this.$t('dashboardTour.step5.title'),
            description: this.$t('dashboardTour.step5.description')
          }
        },
        {
          element: '#transactionList',
          popover:
          {
            title: this.$t('dashboardTour.step6.title'),
            description: this.$t('dashboardTour.step6.description')
          }
        },
        {
          element: '#openTransactionCreateModalButton',
          popover:
          {
            title: this.$t('dashboardTour.step7.title'),
            description: this.$t('dashboardTour.step7.description')
          }
        },
        {
          element: '#recurringTransactionList',
          popover:
          {
            title: this.$t('dashboardTour.step8.title'),
            description: this.$t('dashboardTour.step8.description')
          }
        },
        {
          element: '#openRecurringTransactionCreateModalButton',
          popover:
          {
            title: this.$t('dashboardTour.step9.title'),
            description: this.$t('dashboardTour.step9.description')
          }
        }
      ],
      onDestroyed: () => {
        const userId = this.$store.getters['user/getCurrentUser']["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
        const tourStorageKey = `dashboardTourCompleted_${userId}`;

        localStorage.setItem(tourStorageKey, 'true');
      },
    })

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const userId = this.$store.getters['user/getCurrentUser']["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
    const tourStorageKey = `dashboardTourCompleted_${userId}`;
    const tourAlreadyShown = localStorage.getItem(tourStorageKey);

    if (!isMobile && !tourAlreadyShown) {
      this.tour.drive();
    }
  }
}

</script>

<style scoped>
/* Tab bar */
.dashboard-tabs {
  display: inline-flex;
  gap: 4px;
  background: #f3f4f6;
  border-radius: 12px;
  padding: 4px;
}

.dash-tab {
  display: inline-flex;
  align-items: center;
  padding: 8px 22px;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  background: transparent;
  border: none;
  border-radius: 9px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.dash-tab:hover { color: #374151; background: #e5e7eb; }
.dash-tab.active {
  color: #fff;
  background: #10b981;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.35);
}

.mobile-notebook-bar {
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border: 1.5px solid #6ee7b7;
  border-radius: 12px;
  padding: 8px 14px 8px 10px;
}

.mobile-notebook-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #10b981, #059669);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  flex-shrink: 0;
}

.mobile-notebook-info {
  display: flex;
  flex-direction: column;
}

.mobile-notebook-label {
  font-size: 10px;
  font-weight: 600;
  color: #059669;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  line-height: 1.2;
}

.mobile-notebook-name {
  font-size: 15px;
  font-weight: 700;
  color: #065f46;
  line-height: 1.3;
}
</style>