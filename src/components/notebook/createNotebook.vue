<template>
    <div class="modal fade modal-bookmark" id="createNotebookModal" tabindex="-1" role="dialog"
        aria-labelledby="createNotebookModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-md" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title" id="createNotebookModalLabel">
                        <span v-if="modalMode === 'create'">{{ $t('createNotebookModal.createTitle') }}</span>
                        <span v-else-if="modalMode === 'edit'">{{ $t('createNotebookModal.editTitle') }} - {{
                            getModalNotebook.name }}</span>
                    </h3>
                    <button class="btn-close" type="button" aria-label="Close" @click="closeModal"> </button>
                </div>
                <div class="modal-body">
                    <form novalidate>
                        <div class="form-row">
                            <div class="form-group col-md-12 d-flex flex-column">
                                <label>{{ $t('createNotebookModal.form.placeholder.name') }}</label>
                                <small v-if="errors.name" class="text-danger"> {{ errors.name }}</small>
                                <input v-model="form.name" class="form-control" type="text" autocomplete="off">
                            </div>
                        </div>
                        <div class="float-end m-t-5">
                            <button class="btn btn-danger" type="button" @click="closeModal">{{ $t('common.cancel')
                            }}</button>
                            <button class="btn btn-success m-l-5" :disabled="!isValid" type="button"
                                @click="saveNotebook">{{ $t('common.save') }}</button>
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

            this.form = {
                name: ''
            }

            setTimeout(() => {
                this.errors = {}
            }, 200)
        },
        async saveNotebook() {
            const isValid = await this.validator.validateForm(this.form, this.errors);
            if (!isValid) return;

            if (this.modalMode === 'create') {
                var response = await notebookService.createNotebook({
                    name: this.form.name
                });

                if (response.status === 200 && response.data) {
                    this.$swal({
                        title: this.$t('createNotebookModal.messages.createSuccess'),
                        icon: "success",
                    });

                    notebookService.mapNotebooksToMenu();
                } else {
                    this.$swal({
                        title: this.$t('createNotebookModal.messages.createError'),
                        icon: "error",
                    });
                }

            } else if (this.modalMode === 'edit') {
                var response = await notebookService.updateNotebook(
                    this.getModalNotebook.id,
                    {
                        id: this.getModalNotebook.id,
                        name: this.form.name
                    }
                );

                if (response.status === 200 && response.data) {
                    this.$swal({
                        title: this.$t('createNotebookModal.messages.editSuccess'),
                        icon: "success",
                    });

                    notebookService.mapNotebooksToMenu();
                } else {
                    this.$swal({
                        title: this.$t('createNotebookModal.messages.editError'),
                        icon: "error"
                    });
                }
            }

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
            name: yup
                .string()
                .required(this.$t('validation.message.required'))
        });

        this.validator = createYupValidator(schema);
    }
}
</script>