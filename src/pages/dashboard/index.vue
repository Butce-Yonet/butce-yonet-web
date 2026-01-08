<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-12 col-md-12 p-5">
        <transaction-list></transaction-list>
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
import * as bootstrap from 'bootstrap';
export default {
  components: {
    'create-notebook': createNotebookComponent,
    'edit-notebook-detail': editNotebookDetailComponent,
    'transaction-list': transactionList
  },
  data() {
    return {
      modal: {},
      detailModal: {}
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
  }
}

</script>