<template>
    <div class="tab-pane fade show active" id="notebook-users-tab-content" role="tabpanel"
        aria-labelledby="notebook-users-tab">

        <!-- Add User Card -->
        <div class="add-section mb-4">
            <div class="add-section-header">
                <i class="fa fa-user-plus me-2"></i>
                {{ $t('common.email') }}
            </div>
            <div class="add-section-body">
                <div class="row g-2 align-items-start">
                    <div class="col">
                        <input
                            v-model="notebookUserForm.email"
                            class="form-control"
                            :disabled="notebookUserFormSubmitting"
                            :placeholder="$t('common.email')"
                            @keyup.enter="saveNotebookUser"
                        />
                        <small class="text-danger mt-1 d-block" v-if="notebookUserFormErrors.email">
                            {{ notebookUserFormErrors.email }}
                        </small>
                    </div>
                    <div class="col-auto">
                        <button
                            class="btn btn-success px-4"
                            @click="saveNotebookUser"
                            :disabled="notebookUserFormSubmitting || !notebookUserFormIsValid"
                        >
                            <span v-if="notebookUserFormSubmitting">
                                <span class="spinner-border spinner-border-sm me-1"></span>
                            </span>
                            <span v-else><i class="fa fa-plus me-1"></i></span>
                            Ekle
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Users List -->
        <div v-if="notebookUserLoading" class="text-center py-5">
            <div class="spinner-border text-success" role="status"></div>
        </div>

        <div v-else-if="notebookUsers.length === 0" class="empty-state">
            <i class="fa fa-users"></i>
            <p>{{ $t('common.noDataText') }}</p>
        </div>

        <div v-else class="user-list">
            <div
                v-for="user in notebookUsers"
                :key="user.id"
                class="user-card"
            >
                <div class="user-avatar" :style="{ background: getAvatarColor(user.name) }">
                    {{ getInitials(user.name, user.surname) }}
                </div>
                <div class="user-info">
                    <div class="user-name">{{ user.name }} {{ user.surname }}</div>
                    <div class="user-email">{{ user.email }}</div>
                </div>
                <div class="user-actions">
                    <span v-if="user.isDefault" class="badge badge-success me-2">
                        <i class="fa fa-star me-1"></i>Sahip
                    </span>
                    <button
                        class="btn btn-sm btn-outline-danger"
                        :disabled="user.isDefault"
                        v-tooltip="$t('common.tooltips.delete')"
                        @click="deleteNotebookUser(user)"
                    >
                        <i class="fa fa-trash"></i>
                    </button>
                </div>
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
        getInitials(name, surname) {
            return ((name?.[0] || '') + (surname?.[0] || '')).toUpperCase();
        },
        getAvatarColor(name) {
            const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];
            const index = (name?.charCodeAt(0) || 0) % colors.length;
            return colors[index];
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

.user-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.user-card {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 16px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    transition: background 0.15s, border-color 0.15s;
}

.user-card:hover {
    background: #f9fafb;
    border-color: #d1d5db;
}

.user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    color: #fff;
    flex-shrink: 0;
}

.user-info {
    flex: 1;
    min-width: 0;
}

.user-name {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.user-email {
    font-size: 12px;
    color: #6b7280;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.user-actions {
    display: flex;
    align-items: center;
    flex-shrink: 0;
}
</style>
