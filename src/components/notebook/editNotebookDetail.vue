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
                                    <div class="col-sm-12 col-md-12">
                                        <EasyDataTable v-model:server-options="notebookUsersServerOptions"
                                            :server-items-length="notebookUsersServerItemsLength"
                                            :headers="notebookUserHeaders" :items="notebookUsers"
                                            :loading="notebookUserLoading">
                                            <template #empty-message>
                                                <span>{{ $t('common.noDataText') }}</span>
                                            </template>
                                        </EasyDataTable>
                                    </div>
                                </div>
                            </div>
                            <div class="tab-pane fade" id="notebook-categories-tab-content" role="tabpanel"
                                aria-labelledby="notebook-categories-tab">
                                <p class="mb-0 m-t-30">
                                    Kategoriler
                                </p>
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
                    text: this.$t('editNotebookDetail.usersTable.headers.username'),
                    value: 'username'
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
        },
        async loadNotebookUsers() {
            this.notebookUserLoading = true;
            var response = await notebookUserService.getNotebookUsers(this.getModalNotebook.id);

            if (response.status === 200) {
                this.notebookUsers = [];

                response.data.data.filter(item => {
                    this.notebookUsers.push({
                        id : item.id,
                        name: item.user.name,
                        surname: item.user.surname,
                        username: item.user.username,
                        email: item.user.email
                    })
                })
            } else {
                this.$swal({
                    title: this.$t('editNotebookDetail.messages.notebookUsersLoadError'),
                    icon: "error",
                });
            }

            this.notebookUserLoading = false;

        }
    },
    watch: {
        '$store.state.notebook.editNotebookDetailModalVisible': function (newVal) {
            if (newVal) {
                this.loadNotebookUsers();
            }
        },
        notebookUsersServerOptions: {
            deep: true,
            async handler(newVal, oldVal) {
                await this.loadNotebookUsers();
            }
        }
    }
}
</script>