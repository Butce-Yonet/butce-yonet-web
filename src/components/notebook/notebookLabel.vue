<template>
    <div class="tab-pane fade" id="notebook-categories-tab-content" role="tabpanel"
        aria-labelledby="notebook-categories-tab">
        <div class="col-sm-12 col-md-12 m-t-20">
            <div class="row">
                <div class="col-sm-12 col-md-4">
                    <input class="form-control fixed-height-input" v-model="notebookLabelForm.name">
                    <small class="text-danger" v-if="notebookLabelFormErrors.name">{{
                        notebookLabelFormErrors.name
                        }}</small>
                </div>
                <div class="col-sm-12 col-md-4">
                    <input class="form-control fixed-height-input" v-model="notebookLabelForm.color" type="color">
                    <small class="text-danger" v-if="notebookLabelFormErrors.color">{{
                        notebookLabelFormErrors.color
                        }}</small>
                </div>
                <div class="col-sm-12 col-md-1">
                    <button class="btn btn-success fixed-height-input" @click="saveNotebookLabel"
                        :disabled="notebookLabelFormSubmitting">
                        <i class="fa fa-plus"></i>
                    </button>
                </div>
            </div> 
            <div class="col-sm-12 col-md-12 m-t-10">
                <EasyDataTable :headers="notebookLabelHeaders" :items="notebookLabels" :loading="notebookLabelLoading">

                    <template #empty-message>
                        <span>{{ $t('common.noDataText') }}</span>
                    </template>

                    <template #item-name="item">
                        <input v-if="item.inlineEdit" v-model="notebookLabelEditForm.name"
                            class="form-control form-control-sm" />
                        <span v-else>{{ item.name }}</span>
                    </template>

                    <template #item-color="item">
                        <input v-if="item.inlineEdit" type="color" v-model="notebookLabelEditForm.color"
                            class="form-control form-control-sm" />
                        <span v-else class="badge pill" :style="{ backgroundColor: item.color }">
                            {{ item.name }}
                        </span>
                    </template>

                    <template #item-actions="item">
                        <button class="btn btn-warning btn-xs" @click="changeInlineEdit(item, true)">
                            <i class="fa fa-pencil"></i>
                        </button>
                        <button class="btn btn-success btn-xs m-l-5" :disabled="notebookLabelEditForm.submitting"
                            @click="editNotebookLabel(item)">
                            <i class="fa fa-save"></i>
                        </button>
                        <button class="btn btn-danger btn-xs m-l-5" @click="deleteNotebookLabel(item)">
                            <i class="fa fa-trash"></i>
                        </button>
                    </template>
                </EasyDataTable>
            </div>
        </div>
    </div>
</template>

<script>
import notebookLabelService from '@/services/notebook.label.service';
import * as yup from 'yup';
import { createYupValidator } from '@/services/validator.service';
export default {
    data() {
        return {
            notebookLabelHeaders: [
                {
                    text: this.$t('editNotebookDetail.labelsTable.headers.name'),
                    value: 'name'
                },
                {
                    text: this.$t('editNotebookDetail.labelsTable.headers.color'),
                    value: 'color'
                },
                {
                    text: this.$t('common.actions'),
                    value: 'actions'
                }
            ],
            notebookLabels: [],
            notebookLabelLoading: false,
            notebookLabelForm: {
                name: '',
                color: '#000000'
            },
            notebookLabelFormErrors: {},
            notebookLabelFormIsValid: false,
            notebookLabelFormSubmitting: false,
            notebookLabelFormValidator: null,
            notebookLabelEditForm: {
                id: null,
                name: '',
                color: '',
                submitting: false
            }
        }
    },
    computed: {
        getModalNotebook() {
            return this.$store.state.notebook.modalNotebook;
        }
    },
    watch: {
        '$store.state.notebook.editNotebookDetailModalVisible': function (newVal) {
            if (!newVal) {
                this.notebookLabelForm = {
                    name: '',
                    color: '#000000'
                }
            } else {
                this.loadNotebookLabels();
            }
        },
        notebookLabelForm: {
            deep: true,
            async handler(newVal, oldVal) {
                if (!oldVal) return;
                this.notebookLabelFormIsValid = await this.notebookLabelFormValidator.validateForm(this.notebookLabelForm, this.notebookLabelFormErrors);
            }
        }
    },
    methods: {
        async loadNotebookLabels() {
            this.notebookLabelLoading = true;
            this.notebookLabels = [];

            try {
                var response = await notebookLabelService.getNotebookLabels(this.getModalNotebook.id);

                if (response.status === 200) {
                    response.data.data.filter(item => {
                        this.notebookLabels.push({
                            id: item.id,
                            name: item.name,
                            color: item.colorCode,
                            inlineEdit: false
                        })
                    })
                } else {
                    this.$swal({
                        title: this.$t('editNotebookDetail.messages.notebookLabelsLoadError'),
                        icon: "error",
                    });
                }

            } catch (e) {
                this.$swal({
                    title: this.$t('editNotebookDetail.messages.notebookLabelsLoadError'),
                    icon: "error",
                });
            } finally {
                this.notebookLabelLoading = false;
            }
        },
        async saveNotebookLabel() {
            this.notebookLabelFormSubmitting = true;

            if (!this.notebookLabelFormIsValid) {
                this.notebookLabelFormSubmitting = false;
                return;
            }

            try {
                var response = await notebookLabelService.createNotebookLabel(this.getModalNotebook.id, {
                    NotebookId: this.getModalNotebook.id,
                    Name: this.notebookLabelForm.name,
                    ColorCode: this.notebookLabelForm.color
                });

                if (response.status === 200) {
                    this.$swal({
                        title: this.$t('editNotebookDetail.messages.notebookLabelCreateSuccess'),
                        icon: "success",
                    });
                    this.notebookLabelForm = {
                        name: '',
                        color: '#000000'
                    }
                    await this.loadNotebookLabels();
                } else {
                    this.$swal({
                        title: this.$t('editNotebookDetail.messages.notebookLabelCreateError'),
                        icon: "error",
                    });
                }

            } catch (e) {
                this.$swal({
                    title: this.$t('editNotebookDetail.messages.notebookLabelCreateError'),
                    icon: "error",
                });
            }

            this.notebookLabelFormSubmitting = false;
        },
        changeInlineEdit(row, state) {
            this.notebookLabels.filter(item => {

                if (item.id == row.id) {
                    item.inlineEdit = state;

                    if (state)
                        this.notebookLabelEditForm = item;
                    else
                        this.notebookLabelEditForm = {
                            id: null,
                            name: '',
                            color: '',
                            submitting: false
                        }
                }

                return item;
            })
        },
        async editNotebookLabel(row) {
            var isValid = await this.notebookLabelFormValidator.validateForm(this.notebookLabelEditForm, {});

            if (isValid === false) {
                this.$swal({
                    title: this.$t('editNotebookDetail.messages.notebookLabelEditError'),
                    icon: "error",
                });
                return;
            }

            this.notebookLabelEditForm.submitting = true;
            try {
                var response = await notebookLabelService.updateNotebookLabel(this.getModalNotebook.id, row.id, {
                    NotebookId: this.getModalNotebook.id,
                    NotebookLabelId: this.notebookLabelEditForm.id,
                    Name: this.notebookLabelEditForm.name,
                    ColorCode: this.notebookLabelEditForm.color
                });

                if (response.status === 200) {
                    this.$swal({
                        title: this.$t('editNotebookDetail.messages.notebookLabelEditSuccess'),
                        icon: "success",
                    });
                    await this.loadNotebookLabels();
                } else {
                    this.$swal({
                        title: this.$t('editNotebookDetail.messages.notebookLabelEditError'),
                        icon: "error",
                    });
                }
            } catch (e) {
                this.$swal({
                    title: this.$t('editNotebookDetail.messages.notebookLabelEditError'),
                    icon: "error",
                });
            } finally {
                this.changeInlineEdit(row, false);
                this.notebookLabelEditForm.submitting = false;
            }

        },
        deleteNotebookLabel(row) {
            this.$swal({
                title: this.$t('editNotebookDetail.messages.notebookLabelAreYouSureDelete'),
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: this.$t('common.yes'),
                denyButtonText: this.$t('common.no'),
            }).then((result) => {
                if (result.isConfirmed) {
                    this.notebookLabelLoading = true;
                    try {
                        notebookLabelService.deleteNotebookLabel(this.getModalNotebook.id, row.id).then((response) => {
                            if (response.status === 200) {
                                this.$swal({
                                    title: this.$t('editNotebookDetail.messages.notebookLabelDeleteSuccess'),
                                    icon: "success",
                                });
                                this.loadNotebookLabels();
                            } else {
                                this.$swal({
                                    title: this.$t('editNotebookDetail.messages.notebookLabelDeleteError'),
                                    icon: "error",
                                });
                            }
                        }).catch(() => {
                            this.$swal({
                                title: this.$t('editNotebookDetail.messages.notebookLabelDeleteError'),
                                icon: "error",
                            });
                        })
                    } catch (e) {
                        this.$swal({
                            title: this.$t('editNotebookDetail.messages.notebookLabelDeleteError'),
                            icon: "error",
                        });
                    } finally {
                        this.notebookLabelLoading = false;
                    }
                }
            });
        }
    },
    created() {
        var notebookLabelSchema = yup.object({
            name: yup.string().required(this.$t('validation.message.required')),
            color: yup.string().required(this.$t('validation.message.required'))
        });

        this.notebookLabelFormValidator = createYupValidator(notebookLabelSchema);
    }
}
</script>
