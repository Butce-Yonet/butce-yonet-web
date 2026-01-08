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
                            <div class="tab-pane fade show active" id="notebook-users-tab-content" role="tabpanel"
                                aria-labelledby="notebook-users-tab">
                                <div class="col-sm-12 col-md-12 m-t-20">
                                    <div class="col-sm-12 col-md-4 offset-md-8">
                                        <div class="input-group input-group-sm">
                                            <input v-model="notebookUserForm.email" class="form-control"
                                                :disabled="notebookUserFormSubmitting"
                                                :placeholder="$t('common.email')" />
                                            <button class="btn btn-success input-group-text" @click="saveNotebookUser"
                                                :disabled="notebookUserFormSubmitting || !notebookUserFormIsValid">
                                                <i class="fa fa-plus" style="color: white;"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div class="col-sm-12 col-md-4 offset-md-8">
                                        <small class="text-danger" v-if="notebookUserFormErrors.email">{{
                                            notebookUserFormErrors.email }}</small>
                                    </div>
                                    <div class="col-sm-12 col-md-12 m-t-10">
                                        <EasyDataTable v-model:server-options="notebookUsersServerOptions"
                                            :server-items-length="notebookUsersServerItemsLength"
                                            :headers="notebookUserHeaders" :items="notebookUsers"
                                            :loading="notebookUserLoading">
                                            <template #empty-message>
                                                <span>{{ $t('common.noDataText') }}</span>
                                            </template>

                                            <template #item-actions="item">
                                                <button class="btn btn-danger btn-xs" :disabled="item.isDefault"
                                                    @click="deleteNotebookUser(item)">
                                                    <i class="fa fa-trash"></i>
                                                </button>
                                            </template>
                                        </EasyDataTable>
                                    </div>
                                </div>
                            </div>
                            <div class="tab-pane fade" id="notebook-categories-tab-content" role="tabpanel"
                                aria-labelledby="notebook-categories-tab">
                                <div class="col-sm-12 col-md-12 m-t-20">
                                    <div class="row">
                                        <div class="col-sm-12 col-md-4">
                                            <input class="form-control fixed-height-input"
                                                v-model="notebookLabelForm.name">
                                            <small class="text-danger" v-if="notebookLabelFormErrors.name">{{
                                                notebookLabelFormErrors.name
                                                }}</small>
                                        </div>
                                        <div class="col-sm-12 col-md-4">
                                            <input class="form-control fixed-height-input"
                                                v-model="notebookLabelForm.color" type="color">
                                            <small class="text-danger" v-if="notebookLabelFormErrors.color">{{
                                                notebookLabelFormErrors.color
                                            }}</small>
                                        </div>
                                        <div class="col-sm-12 col-md-1">
                                            <button class="btn btn-success fixed-height-input"
                                                @click="saveNotebookLabel" :disabled="notebookLabelFormSubmitting">
                                                <i class="fa fa-plus"></i>
                                            </button>
                                        </div>
                                    </div> 
                                    <div class="col-sm-12 col-md-12 m-t-10">
                                        <EasyDataTable v-model:server-options="notebookLabelsServerOptions"
                                            :server-items-length="notebookLabelsServerItemsLength"
                                            :headers="notebookLabelHeaders" :items="notebookLabels"
                                            :loading="notebookLabelLoading">

                                            <template #empty-message>
                                                <span>{{ $t('common.noDataText') }}</span>
                                            </template>

                                            <template #item-name="item">
                                                <input v-if="item.inlineEdit" v-model="notebookLabelEditForm.name"
                                                    class="form-control form-control-sm" />
                                                <span v-else>{{ item.name }}</span>
                                            </template>

                                            <template #item-color="item">
                                                <input v-if="item.inlineEdit" type="color"
                                                    v-model="notebookLabelEditForm.color"
                                                    class="form-control form-control-sm" />
                                                <span v-else class="badge pill"
                                                    :style="{ backgroundColor: item.color }">
                                                    {{ item.name }}
                                                </span>
                                            </template>

                                            <template #item-actions="item">
                                                <button class="btn btn-warning btn-xs"
                                                    @click="changeInlineEdit(item, true)">
                                                    <i class="fa fa-pencil"></i>
                                                </button>
                                                <button class="btn btn-success btn-xs m-l-5"
                                                    :disabled="notebookLabelEditForm.submitting"
                                                    @click="editNotebookLabel(item)">
                                                    <i class="fa fa-save"></i>
                                                </button>
                                                <button class="btn btn-danger btn-xs m-l-5"
                                                    @click="deleteNotebookLabel(item)">
                                                    <i class="fa fa-trash"></i>
                                                </button>
                                            </template>
                                        </EasyDataTable>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import notebookUserService from '@/services/notebook.users.service'
import notebookLabelService from '@/services/notebook.label.service';
import * as yup from 'yup';
import { createYupValidator } from '@/services/validator.service';
export default {
    data() {
        return {
            notebookUserHeaders: [
                {
                    text: this.$t('editNotebookDetail.usersTable.headers.name'),
                    value: 'name'
                },
                {
                    text: this.$t('editNotebookDetail.usersTable.headers.surname'),
                    value: 'surname'
                },
                {
                    text: this.$t('editNotebookDetail.usersTable.headers.email'),
                    value: 'email'
                },
                {
                    text: this.$t('common.actions'),
                    value: 'actions'
                }
            ],
            notebookUserLoading: false,
            notebookUsers: [],
            notebookUsersServerItemsLength: 0,
            notebookUsersServerOptions: {
                page: 1,
                rowsPerPage: 10,
                sortBy: '',
                sortType: ''
            },
            notebookUserForm: {
                email: ''
            },
            notebookUserFormErrors: {},
            notebookUserFormIsValid: false,
            notebookUserFormSubmitting: false,
            notebookUserFormValidator: null,
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
            notebookLabelLoading: false,
            notebookLabels: [],
            notebookLabelsServerItemsLength: 0,
            notebookLabelsServerOptions: {
                page: 1,
                rowsPerPage: 10,
                sortBy: '',
                sortType: ''
            },
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
    methods: {
        closeModal() {
            this.$store.dispatch('notebook/hideEditNotebookDetailModal');
            document.getElementById('notebook-users-tab').click();
            this.notebookUserForm = {
                email: ''
            }

            this.notebookLabelForm = {
                name: '',
                color: '#000000'
            }
        },
        async loadNotebookUsers() {
            this.notebookUserLoading = true;
            this.notebookUsers = [];

            try {
                var response = await notebookUserService.getNotebookUsers(this.getModalNotebook.id);
                if (response.status === 200) {

                    response.data.data.filter(item => {
                        this.notebookUsers.push({
                            id: item.userId,
                            name: item.user.name,
                            surname: item.user.surname,
                            username: item.user.username,
                            email: item.user.email,
                            isDefault: item.isDefault
                        })
                    })
                } else {
                    this.$swal({
                        title: this.$t('editNotebookDetail.messages.notebookUsersLoadError'),
                        icon: "error",
                    });
                }
            } catch (e) {
                this.$swal({
                    title: this.$t('editNotebookDetail.messages.notebookUsersLoadError'),
                    icon: "error",
                });
            } finally {
                this.notebookUserLoading = false;
            }
        },
        async saveNotebookUser() {
            this.notebookUserFormSubmitting = true;

            if (!this.notebookUserFormIsValid) {
                this.notebookUserFormSubmitting = false;
                return;
            }

            try {
                var response = await notebookUserService.addNotebookUser(this.getModalNotebook.id, {
                    NotebookId: this.getModalNotebook.id,
                    email: this.notebookUserForm.email
                });

                if (response.status === 200) {
                    this.$swal({
                        title: this.$t('editNotebookDetail.messages.notebookUserCreateSuccess'),
                        icon: "success",
                    });
                    this.notebookUserForm = {
                        email: ''
                    }
                    await this.loadNotebookUsers();
                } else {
                    this.$swal({
                        title: this.$t('editNotebookDetail.messages.notebookUserCreateError'),
                        icon: "error",
                    });
                }
            } catch (e) {
                this.$swal({
                    title: this.$t('editNotebookDetail.messages.notebookUserCreateError'),
                    icon: "error",
                });
            } finally {
                this.notebookUserFormSubmitting = false;
            }
        },
        deleteNotebookUser(item) {
            this.$swal({
                title: this.$t('createNotebookModal.messages.areYouSureDelete'),
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: this.$t('common.yes'),
                denyButtonText: this.$t('common.no'),
            }).then((result) => {
                if (result.isConfirmed) {
                    this.notebookUserLoading = true;
                    try {
                        notebookUserService.removeNotebookUser(this.getModalNotebook.id, item.id).then((response) => {
                            if (response.status === 200) {
                                this.$swal({
                                    title: this.$t('editNotebookDetail.messages.notebookUserDeleteSuccess'),
                                    icon: "success",
                                });
                                this.loadNotebookUsers();
                            } else {
                                this.$swal({
                                    title: this.$t('editNotebookDetail.messages.notebookUserDeleteError'),
                                    icon: "error",
                                });
                            }
                        }).catch(() => {
                            this.$swal({
                                title: this.$t('editNotebookDetail.messages.notebookUserDeleteError'),
                                icon: "error",
                            });
                        })
                    } catch (e) {
                        this.$swal({
                            title: this.$t('editNotebookDetail.messages.notebookUserDeleteError'),
                            icon: "error",
                        });
                    } finally {
                        this.notebookUserLoading = false;
                    }
                }
            });
        },
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
    watch: {
        '$store.state.notebook.editNotebookDetailModalVisible': function (newVal) {
            if (newVal) {
                this.loadNotebookUsers();
                this.loadNotebookLabels();
            }
        },
        notebookUsersServerOptions: {
            deep: true,
            async handler(newVal, oldVal) {
                await this.loadNotebookUsers();
            }
        },
        notebookUserForm: {
            deep: true,
            async handler(newVal, oldVal) {
                if (!oldVal) return;
                this.notebookUserFormIsValid = await this.notebookUserFormValidator.validateForm(this.notebookUserForm, this.notebookUserFormErrors);
            }
        },
        notebookLabelsServerOptions: {
            deep: true,
            async handler(newVal, oldVal) {
                await this.loadNotebookLabels();
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
    created() {
        var notebookUserSchema = yup.object({
            email: yup.string().email(this.$t('validation.message.email')).required(this.$t('validation.message.required'))
        });

        this.notebookUserFormValidator = createYupValidator(notebookUserSchema);

        var notebookLabelSchema = yup.object({
            name: yup.string().required(this.$t('validation.message.required')),
            color: yup.string().required(this.$t('validation.message.required'))
        });

        this.notebookLabelFormValidator = createYupValidator(notebookLabelSchema);
    }
}
</script>


<style scoped>
.fixed-height-input {
    height: 32px;
    padding: 4px 8px;
}
</style>