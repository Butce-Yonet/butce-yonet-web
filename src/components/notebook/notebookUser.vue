<template>
    <div class="tab-pane fade show active" id="notebook-users-tab-content" role="tabpanel"
        aria-labelledby="notebook-users-tab">
        <div class="col-sm-12 col-md-12 m-t-20">
            <div class="col-sm-12 col-md-4 offset-md-8">
                <div class="input-group input-group-sm">
                    <input v-model="notebookUserForm.email" class="form-control" :disabled="notebookUserFormSubmitting"
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
                <EasyDataTable :headers="notebookUserHeaders" :items="notebookUsers" :loading="notebookUserLoading">
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
</template>

<script>
import notebookUserService from '@/services/notebook.users.service'
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
            notebookUserForm: {
                email: ''
            },
            notebookUserFormErrors: {},
            notebookUserFormIsValid: false,
            notebookUserFormSubmitting: false,
            notebookUserFormValidator: null
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
                this.notebookUserForm = {
                    email: ''
                }
            } else {
                this.loadNotebookUsers();
            }
        },
        notebookUserForm: {
            deep: true,
            async handler(newVal, oldVal) {
                if (!oldVal) return;
                this.notebookUserFormIsValid = await this.notebookUserFormValidator.validateForm(this.notebookUserForm, this.notebookUserFormErrors);
            }
        },
    },
    methods: {
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
        }
    },
    created() {
        var notebookUserSchema = yup.object({
            email: yup.string().email(this.$t('validation.message.email')).required(this.$t('validation.message.required'))
        });

        this.notebookUserFormValidator = createYupValidator(notebookUserSchema);
    }
}
</script>