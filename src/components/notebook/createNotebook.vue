<template>
    <div class="modal fade modal-bookmark" id="createNotebookModal" tabindex="-1" role="dialog"
        aria-labelledby="createNotebookModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-md" role="document">
            <div class="modal-content border-0 shadow-lg">

                <div class="modal-header border-0 pb-0 px-4 pt-4">
                    <div class="d-flex align-items-center gap-3">
                        <div class="notebook-icon-wrap" :class="modalMode === 'edit' ? 'icon-edit' : 'icon-create'">
                            <i :class="modalMode === 'edit' ? 'fa fa-pencil' : 'fa fa-plus'"></i>
                        </div>
                        <div>
                            <p class="text-muted mb-0 small">
                                {{ modalMode === 'edit' ? $t('createNotebookModal.editTitle') : $t('createNotebookModal.createTitle') }}
                            </p>
                            <h5 class="modal-title mb-0 fw-semibold" id="createNotebookModalLabel">
                                {{ modalMode === 'edit' ? getModalNotebook.name : $t('createNotebookModal.form.placeholder.name') }}
                            </h5>
                        </div>
                    </div>
                    <button class="btn-close" type="button" aria-label="Close" @click="closeModal"></button>
                </div>

                <div class="modal-body px-4 pt-4 pb-4">
                    <form novalidate @submit.prevent="saveNotebook">
                        <div class="mb-4">
                            <label class="form-label fw-semibold text-secondary small text-uppercase tracking-wide">
                                {{ $t('createNotebookModal.form.placeholder.name') }}
                            </label>
                            <input
                                v-model="form.name"
                                class="form-control form-control-lg notebook-input"
                                :class="{ 'is-invalid': errors.name }"
                                type="text"
                                autocomplete="off"
                                :placeholder="$t('createNotebookModal.form.placeholder.name')"
                            />
                            <div class="invalid-feedback" v-if="errors.name">{{ errors.name }}</div>
                        </div>

                        <div class="d-flex gap-2 justify-content-end">
                            <button class="btn btn-light px-4" type="button" @click="closeModal">
                                {{ $t('common.cancel') }}
                            </button>
                            <button
                                class="btn px-4 save-btn"
                                :class="modalMode === 'edit' ? 'btn-warning' : 'btn-success'"
                                :disabled="!isValid || submitting"
                                type="submit"
                            >
                                <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                                <i v-else class="fa me-2" :class="modalMode === 'edit' ? 'fa-check' : 'fa-plus'"></i>
                                {{ $t('common.save') }}
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    </div>
</template>

<script>
import * as yup from 'yup';
import { createYupValidator } from '@/services/validator.service';
import notebookService from '@/services/notebook.service';
export default {
    data() {
        return {
            form: {
                name: ''
            },
            isValid: false,
            submitting: false,
            errors: {},
            validator: null
        }
    },
    computed: {
        modalMode() {
            return this.$store.state.notebook.modalMode;
        },
        getModalNotebook() {
            return this.$store.state.notebook.modalNotebook;
        }
    },
    methods: {
        closeModal() {
            this.$store.dispatch('notebook/hideCreateNotebookModal');
            this.$store.dispatch('notebook/setModalMode', 'create');

            this.form = { name: '' }

            setTimeout(() => {
                this.errors = {}
            }, 200)
        },
        async saveNotebook() {
            const isValid = await this.validator.validateForm(this.form, this.errors);
            if (!isValid) return;

            this.submitting = true;

            if (this.modalMode === 'create') {
                try {
                    var response = await notebookService.createNotebook({
                        name: this.form.name
                    });

                    if (response.status === 200 && response.data) {
                        this.$swal({ title: this.$t('createNotebookModal.messages.createSuccess'), icon: "success" });
                        notebookService.mapNotebooksToMenu();
                    } else {
                        this.$swal({ title: this.$t('createNotebookModal.messages.createError'), icon: "error" });
                    }
                } catch (e) {
                    this.$swal({ title: this.$t('createNotebookModal.messages.createError'), icon: "error" });
                }

            } else if (this.modalMode === 'edit') {
                try {
                    var response = await notebookService.updateNotebook(
                        this.getModalNotebook.id,
                        { id: this.getModalNotebook.id, name: this.form.name }
                    );

                    if (response.status === 200 && response.data) {
                        this.$swal({ title: this.$t('createNotebookModal.messages.editSuccess'), icon: "success" });
                        notebookService.mapNotebooksToMenu();
                    } else {
                        this.$swal({ title: this.$t('createNotebookModal.messages.editError'), icon: "error" });
                    }
                } catch (e) {
                    this.$swal({ title: this.$t('createNotebookModal.messages.editError'), icon: "error" });
                }
            }

            this.submitting = false;
            this.closeModal();
        }
    },
    watch: {
        form: {
            deep: true,
            async handler(newVal, oldVal) {
                if (!oldVal) return;
                this.isValid = await this.validator.validateForm(this.form, this.errors);
            }
        },
        modalMode(newVal) {
            if (newVal === 'edit' && this.getModalNotebook) {
                this.form.name = this.getModalNotebook.name;
            } else {
                this.form.name = '';
            }
        }
    },
    created() {
        var schema = yup.object({
            name: yup.string().required(this.$t('validation.message.required'))
        });

        this.validator = createYupValidator(schema);
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
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 16px;
    flex-shrink: 0;
}

.icon-create {
    background: linear-gradient(135deg, #10b981, #059669);
}

.icon-edit {
    background: linear-gradient(135deg, #f59e0b, #d97706);
}

.notebook-input {
    border-radius: 10px;
    border: 1.5px solid #e5e7eb;
    font-size: 15px;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.notebook-input:focus {
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12);
}

.notebook-input.is-invalid {
    border-color: #ef4444;
}

.tracking-wide {
    letter-spacing: 0.05em;
}

.save-btn {
    font-weight: 600;
}
</style>
