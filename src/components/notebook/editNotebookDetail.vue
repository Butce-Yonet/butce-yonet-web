<template>
    <div class="modal fade modal-bookmark" id="editNotebookDetailModal" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h4 class="modal-title">
                        <span>{{ $t('editNotebookDetail.title') }} - {{ getModalNotebook.name }}</span>
                    </h4>
                    <button class="btn-close" type="button" aria-label="Close" @click="closeModal"></button>
                </div>
                <div class="modal-body">
                    <div class="col-sm-12 col-xl-12">
                        <ul class="nav nav-pills nav-primary" id="pills-tab" role="tablist">
                            <li class="nav-item"><a class="nav-link active" id="notebook-users-tab"
                                    data-bs-toggle="pill" href="#notebook-users-tab-content" role="tab"
                                    aria-selected="true">
                                    <i class="fa fa-users"></i>
                                    {{ $t('editNotebookDetail.users') }}
                                    <div class="d-flex"></div>
                                </a></li>
                            <li class="nav-item"><a class="nav-link" id="notebook-categories-tab" data-bs-toggle="pill"
                                    href="#notebook-categories-tab-content" role="tab" aria-selected="false">
                                    <i class="fa fa-tags"></i>
                                    {{ $t('editNotebookDetail.categories') }}
                                </a></li>
                        </ul>
                        <div class="tab-content" id="pills-tabContent">
                            <notebook-user></notebook-user>
                            <notebook-label></notebook-label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import notebookUser from '@/components/notebook/notebookUser.vue';
import notebookLabel from '@/components/notebook/notebookLabel.vue';
export default {
    components: {
        'notebook-user': notebookUser,
        'notebook-label': notebookLabel
    },
    computed: {
        getModalNotebook() {
            return this.$store.state.notebook.modalNotebook;
        }
    },
    methods: {
        closeModal() {
            this.$store.dispatch('notebook/hideEditNotebookDetailModal');
            document.getElementById('notebook-users-tab').click();
        }
    }
}
</script>


<style scoped>
.fixed-height-input {
    height: 32px;
    padding: 4px 8px;
}
</style>