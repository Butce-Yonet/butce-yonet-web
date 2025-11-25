<template>
  <div class="container-fluid">
    <create-notebook></create-notebook>
  </div>
</template>

<script>
import createNotebookComponent from '@/components/notebook/createNotebook.vue';
import * as bootstrap from 'bootstrap';
export default {
  components: {
    'create-notebook': createNotebookComponent
  },
  data() {
    return {
      modal: {}
    }
  },
  watch:{
    '$store.state.notebook.createNotebookModalVisible'(newVal){
      if(newVal){
        this.modal.show();
      }else{
        this.modal.hide();
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
  }
}

</script>