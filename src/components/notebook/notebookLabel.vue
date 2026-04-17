<template>
    <div class="tab-pane fade" id="notebook-categories-tab-content" role="tabpanel"
        aria-labelledby="notebook-categories-tab">

        <!-- Add Label Card -->
        <div class="add-section mb-4">
            <div class="add-section-header">
                <i class="fa fa-tag me-2"></i>
                {{ $t('editNotebookDetail.labelsTable.headers.name') }}
            </div>
            <div class="add-section-body">
                <div class="row g-2 align-items-start">
                    <div class="col">
                        <input
                            class="form-control"
                            v-model="notebookLabelForm.name"
                            :placeholder="$t('editNotebookDetail.labelsTable.headers.name')"
                            @keyup.enter="saveNotebookLabel"
                        />
                        <small class="text-danger mt-1 d-block" v-if="notebookLabelFormErrors.name">
                            {{ notebookLabelFormErrors.name }}
                        </small>
                    </div>
                    <div class="col-auto">
                        <div class="color-picker-wrap">
                            <input
                                class="form-control form-control-color"
                                v-model="notebookLabelForm.color"
                                type="color"
                                :title="$t('editNotebookDetail.labelsTable.headers.color')"
                            />
                        </div>
                        <small class="text-danger mt-1 d-block" v-if="notebookLabelFormErrors.color">
                            {{ notebookLabelFormErrors.color }}
                        </small>
                    </div>
                    <div class="col-auto">
                        <button
                            class="btn btn-success px-4"
                            @click="saveNotebookLabel"
                            :disabled="notebookLabelFormSubmitting"
                        >
                            <span v-if="notebookLabelFormSubmitting">
                                <span class="spinner-border spinner-border-sm me-1"></span>
                            </span>
                            <span v-else><i class="fa fa-plus me-1"></i></span>
                            Ekle
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Labels List -->
        <div v-if="notebookLabelLoading" class="text-center py-5">
            <div class="spinner-border text-success" role="status"></div>
        </div>

        <div v-else-if="notebookLabels.length === 0" class="empty-state">
            <i class="fa fa-tags"></i>
            <p>{{ $t('common.noDataText') }}</p>
        </div>

        <div v-else class="label-list">
            <div
                v-for="label in notebookLabels"
                :key="label.id"
                class="label-card"
                :class="{ 'label-card--editing': label.inlineEdit }"
            >
                <!-- View mode -->
                <template v-if="!label.inlineEdit">
                    <div class="label-color-dot" :style="{ background: label.color }"></div>
                    <div class="label-badge" :style="{ background: label.color + '22', color: label.color, borderColor: label.color + '44' }">
                        {{ label.name }}
                    </div>
                    <div class="label-actions ms-auto">
                        <button
                            class="btn btn-sm btn-outline-warning me-1"
                            v-tooltip="$t('common.tooltips.edit')"
                            @click="changeInlineEdit(label, true)"
                        >
                            <i class="fa fa-pencil"></i>
                        </button>
                        <button
                            class="btn btn-sm btn-outline-danger"
                            v-tooltip="$t('common.tooltips.delete')"
                            @click="deleteNotebookLabel(label)"
                        >
                            <i class="fa fa-trash"></i>
                        </button>
                    </div>
                </template>

                <!-- Edit mode -->
                <template v-else>
                    <input
                        class="form-control form-control-sm"
                        v-model="notebookLabelEditForm.name"
                        style="max-width: 220px;"
                    />
                    <input
                        type="color"
                        class="form-control form-control-color form-control-sm ms-2"
                        v-model="notebookLabelEditForm.color"
                    />
                    <div class="label-actions ms-auto">
                        <button
                            class="btn btn-sm btn-success me-1"
                            v-tooltip="$t('common.save')"
                            :disabled="notebookLabelEditForm.submitting"
                            @click="editNotebookLabel(label)"
                        >
                            <span v-if="notebookLabelEditForm.submitting">
                                <span class="spinner-border spinner-border-sm"></span>
                            </span>
                            <i v-else class="fa fa-save"></i>
                        </button>
                        <button
                            class="btn btn-sm btn-outline-secondary"
                            v-tooltip="$t('common.cancel')"
                            @click="changeInlineEdit(label, false)"
                        >
                            <i class="fa fa-times"></i>
                        </button>
                    </div>
                </template>
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
            notebookLabels: [],
            notebookLabelLoading: false,
            notebookLabelForm: {
                name: '',
                color: '#10b981'
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
                    color: '#10b981'
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
                        color: '#10b981'
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
                        this.notebookLabelEditForm = { ...item };
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

<style scoped>
.add-section {
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    overflow: hidden;
}

.add-section-header {
    background: #f9fafb;
    padding: 10px 16px;
    font-size: 13px;
    font-weight: 600;
    color: #6b7280;
    border-bottom: 1px solid #e5e7eb;
}

.add-section-body {
    padding: 16px;
}

.color-picker-wrap .form-control-color {
    width: 48px;
    height: 38px;
    padding: 2px 4px;
    border-radius: 8px;
    cursor: pointer;
}

.empty-state {
    text-align: center;
    padding: 48px 0;
    color: #9ca3af;
}

.empty-state i {
    font-size: 40px;
    margin-bottom: 12px;
    display: block;
}

.empty-state p {
    margin: 0;
    font-size: 14px;
}

.label-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.label-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    transition: background 0.15s, border-color 0.15s;
    min-height: 52px;
}

.label-card:hover {
    background: #f9fafb;
    border-color: #d1d5db;
}

.label-card--editing {
    background: #fffbeb;
    border-color: #fcd34d;
}

.label-color-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
}

.label-badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 12px;
    border-radius: 20px;
    border: 1px solid;
    font-size: 13px;
    font-weight: 600;
}

.label-actions {
    display: flex;
    align-items: center;
    gap: 4px;
}
</style>
