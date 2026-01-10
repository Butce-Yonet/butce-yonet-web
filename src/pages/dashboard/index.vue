<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-12 col-md-12 m-t-15">
        <transaction-list></transaction-list>
      </div>
      <div class="col-sm-12 col-md-8">
        <recurring-transaction-list></recurring-transaction-list>
      </div>
    </div>
    <create-notebook></create-notebook>
    <edit-notebook-detail></edit-notebook-detail>
  </div>
</template>

<script>
import createNotebookComponent from '@/components/notebook/createNotebook.vue';
import editNotebookDetailComponent from '@/components/notebook/editNotebookDetail.vue';
import transactionList from '@/components/transaction/transactionList.vue';
import recurringTransactionList from '@/components/recurringtransaction/recurringTransactionList.vue';
import * as bootstrap from 'bootstrap';

import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export default {
  components: {
    'create-notebook': createNotebookComponent,
    'edit-notebook-detail': editNotebookDetailComponent,
    'transaction-list': transactionList,
    'recurring-transaction-list': recurringTransactionList
  },
  data() {
    return {
      modal: {},
      detailModal: {},
      tour: {}
    }
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