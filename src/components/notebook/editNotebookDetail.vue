<template>
    <div class="modal fade modal-bookmark" id="editNotebookDetailModal" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
            <div class="modal-content border-0 shadow-lg">

                <div class="modal-header border-0 pb-0 px-4 pt-4">
                    <div class="d-flex align-items-center gap-3">
                        <div class="notebook-icon-wrap">
                            <i class="fa fa-book"></i>
                        </div>
                        <div>
                            <p class="text-muted mb-0 small">{{ $t('editNotebookDetail.title') }}</p>
                            <h5 class="modal-title mb-0 fw-semibold">{{ getModalNotebook.name }}</h5>
                        </div>
                    </div>
                    <button class="btn-close" type="button" aria-label="Close" @click="closeModal"></button>
                </div>

                <div class="modal-body px-4 pt-3 pb-4">
                    <ul class="nav nav-tabs detail-tabs mb-4" id="pills-tab" role="tablist">
                        <li class="nav-item">
                            <a class="nav-link active" id="notebook-users-tab" data-bs-toggle="pill"
                                href="#notebook-users-tab-content" role="tab" aria-selected="true">
                                <i class="fa fa-users me-2"></i>
                                {{ $t('editNotebookDetail.users') }}
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" id="notebook-categories-tab" data-bs-toggle="pill"
                                href="#notebook-categories-tab-content" role="tab" aria-selected="false">
                                <i class="fa fa-tags me-2"></i>
                                {{ $t('editNotebookDetail.categories') }}
                            </a>
                        </li>
                    </ul>

                    <div class="tab-content" id="pills-tabContent">
                        <notebook-user></notebook-user>
                        <notebook-label></notebook-label>
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
.modal-content {
    border-radius: 16px;
}

.modal-header {
    border-radius: 16px 16px 0 0;
}

.notebook-icon-wrap {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: linear-gradient(135deg, #10b981, #059669);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 18px;
    flex-shrink: 0;
}

.detail-tabs {
    border-bottom: 2px solid #f0f0f0;
    gap: 4px;
}

.detail-tabs .nav-link {
    color: #6b7280;
    font-weight: 500;
    font-size: 14px;
    padding: 10px 20px;
    border: none;
    border-radius: 8px 8px 0 0;
    transition: all 0.2s;
}

.detail-tabs .nav-link:hover {
    color: #10b981;
    background: #f0fdf4;
}

.detail-tabs .nav-link.active {
    color: #10b981;
    background: #f0fdf4;
    border-bottom: 2px solid #10b981;
    font-weight: 600;
}
</style>
