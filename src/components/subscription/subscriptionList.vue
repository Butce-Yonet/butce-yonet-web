<template>
    <div class="card border sub-card">
        <div class="card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div class="d-flex align-items-center gap-2">
                <div class="sub-header-icon">
                    <i class="fa fa-refresh"></i>
                </div>
                <h5 class="mb-0">{{ $t('subscriptionList.title') }}</h5>
            </div>
            <button class="btn btn-success btn-sm" @click="openCreateModal">
                <i class="fa fa-plus me-1"></i>
                {{ $t('subscriptionList.addButton') }}
            </button>
        </div>

        <!-- Status tabs -->
        <div class="sub-tab-bar">
            <button
                v-for="tab in tabs"
                :key="tab.key"
                class="sub-tab"
                :class="{ active: activeTab === tab.key }"
                @click="selectTab(tab.key)"
            >
                {{ tab.text }}
            </button>
        </div>

        <div class="card-body sub-body">

            <div v-if="loading" class="state-box">
                <div class="spinner-border text-success"></div>
            </div>

            <div v-else-if="rows.length === 0" class="state-box">
                <i class="fa fa-refresh state-icon"></i>
                <span class="state-text">{{ $t('common.noDataText') }}</span>
            </div>

            <div v-else class="sub-grid">
                <div
                    v-for="item in rows"
                    :key="item.id"
                    class="sub-tile"
                    :class="'accent-' + (item.computedStatus ? item.computedStatus.toLowerCase() : 'none')"
                >
                    <div class="sub-tile-actions">
                        <button class="sub-icon-btn pay" v-tooltip="$t('subscriptionList.tooltips.pay')" @click="openPayModal(item)">
                            <i class="fa fa-check"></i>
                        </button>
                        <button class="sub-icon-btn edit" v-tooltip="$t('common.tooltips.edit')" @click="openEditModal(item)">
                            <i class="fa fa-pencil"></i>
                        </button>
                        <button class="sub-icon-btn danger" v-tooltip="$t('common.tooltips.delete')" @click="deleteSubscription(item)">
                            <i class="fa fa-trash"></i>
                        </button>
                    </div>

                    <div class="sub-tile-header">
                        <span class="sub-tile-icon"><i class="fa fa-refresh"></i></span>
                    </div>

                    <div class="sub-tile-name" :title="item.name">{{ item.name }}</div>
                    <span class="badge badge-light-secondary sub-freq-badge">{{ formatFrequency(item) }}</span>

                    <div class="sub-tile-next">
                        <i class="fa fa-calendar me-1"></i>
                        {{ item.nextOccurrence ? formatDate(item.nextOccurrence) : '—' }}
                    </div>

                    <div class="sub-tile-labels" v-if="item.labels && item.labels.length > 0">
                        <span v-for="label in item.labels" :key="label.id" class="badge"
                            :style="{ backgroundColor: label.colorCode }">
                            {{ label.name }}
                        </span>
                    </div>

                    <div class="sub-tile-footer">
                        <span class="sub-tile-amount" :class="{ 'sub-amount-muted': item.amount == null }">
                            {{ formatAmount(item) }}
                        </span>
                        <span v-if="item.computedStatus" class="badge status-badge" :class="'status-' + item.computedStatus.toLowerCase()">
                            {{ statusLabel(item.computedStatus) }}
                        </span>
                    </div>
                </div>
            </div>

            <div v-if="!loading && rows.length > 0" class="sub-pagination">
                <span class="sub-pagination-info">{{ pageInfoText }}</span>
                <div class="sub-pagination-nav">
                    <button class="sub-page-btn" :disabled="serverOptions.page <= 1" @click="prevPage">
                        <i class="fa fa-chevron-left"></i>
                    </button>
                    <button class="sub-page-btn" :disabled="serverOptions.page >= totalPages" @click="nextPage">
                        <i class="fa fa-chevron-right"></i>
                    </button>
                </div>
            </div>

        </div>
    </div>

    <Teleport to="body">
        <subscription-modal
            :mode="modalMode"
            :subscriptionData="selectedSubscription"
            :modal="modal"
            @saved="loadSubscriptions"
        ></subscription-modal>
        <subscription-pay-modal
            :subscription="selectedSubscription"
            :modal="payModal"
            @saved="loadSubscriptions"
        ></subscription-pay-modal>
    </Teleport>
</template>

<script>
import subscriptionModal from './subscriptionModal.vue';
import subscriptionPayModal from './subscriptionPayModal.vue';
import * as bootstrap from 'bootstrap';
import subscriptionService from '@/services/subscription.service';
import moment from 'moment';
import { computeSubscriptionStatus } from '@/composables/subscriptionStatus';

export default {
    components: {
        'subscription-modal': subscriptionModal,
        'subscription-pay-modal': subscriptionPayModal,
    },
    data() {
        return {
            loading: false,
            activeTab: 'All',
            subscriptions: [],
            itemsLength: 0,
            serverOptions: {
                page: 1,
                rowsPerPage: 10,
                sortBy: '',
                sortType: 'Ascending',
            },
            modal: {},
            payModal: {},
            modalMode: 'create',
            selectedSubscription: null,
            frequencies: [
                { value: 0, text: this.$t('common.frequency.daily') },
                { value: 1, text: this.$t('common.frequency.weekly') },
                { value: 2, text: this.$t('common.frequency.monthly') },
                { value: 3, text: this.$t('common.frequency.yearly') },
                { value: 4, text: this.$t('common.frequency.lastDayOfTheMonth') },
                { value: 5, text: this.$t('common.frequency.firstBusinessDayOfTheMonth') },
                { value: 6, text: this.$t('common.frequency.lastBusinessDayOfTheMonth') },
                { value: 7, text: this.$t('common.frequency.xTHOfTheMonth') },
            ],
        };
    },
    computed: {
        tabs() {
            return [
                { key: 'All', text: this.$t('subscriptionList.tabs.all') },
                { key: 'Upcoming', text: this.$t('subscriptionList.tabs.upcoming') },
                { key: 'Paid', text: this.$t('subscriptionList.tabs.paid') },
                { key: 'Overdue', text: this.$t('subscriptionList.tabs.overdue') },
            ];
        },
        rows() {
            return this.subscriptions.map(s => ({ ...s, computedStatus: computeSubscriptionStatus(s) }));
        },
        totalPages() {
            return Math.max(1, Math.ceil(this.itemsLength / this.serverOptions.rowsPerPage));
        },
        pageInfoText() {
            if (this.itemsLength === 0) return '';
            const start = (this.serverOptions.page - 1) * this.serverOptions.rowsPerPage + 1;
            const end = Math.min(this.serverOptions.page * this.serverOptions.rowsPerPage, this.itemsLength);
            return `${start}–${end} / ${this.itemsLength}`;
        }
    },
    watch: {
        '$store.state.dashboard.openSubscriptionModalTrigger'() {
            this.openCreateModal();
        },
        serverOptions: {
            deep: true,
            async handler() {
                await this.loadSubscriptions();
            }
        },
    },
    methods: {
        prevPage() {
            if (this.serverOptions.page > 1) this.serverOptions.page--;
        },
        nextPage() {
            if (this.serverOptions.page < this.totalPages) this.serverOptions.page++;
        },
        selectTab(key) {
            if (this.activeTab === key) return;
            this.activeTab = key;
            this.serverOptions.page = 1;
            this.loadSubscriptions();
        },
        async loadSubscriptions() {
            this.loading = true;
            const queryParams = {
                PageNumber: this.serverOptions.page,
                PageSize: this.serverOptions.rowsPerPage,
                SortColumn: '',
                SortDirection: 'Ascending',
            };
            if (this.activeTab !== 'All') {
                queryParams.Status = this.activeTab;
            }

            try {
                const response = await subscriptionService.getAllSubscriptions(queryParams);

                if (response.status !== 200) {
                    this.$swal('Error', this.$t('subscriptionList.messages.loadError'), 'error');
                    return;
                }

                this.itemsLength = response.data.data.totalRecords;
                this.subscriptions = response.data.data.items;
            } catch (e) {
                this.$swal('Error', this.$t('subscriptionList.messages.loadError'), 'error');
            } finally {
                this.loading = false;
            }
        },
        openCreateModal() {
            this.modalMode = 'create';
            this.selectedSubscription = null;
            this.modal.show();
        },
        openEditModal(item) {
            this.modalMode = 'edit';
            this.selectedSubscription = item;
            this.modal.show();
        },
        openPayModal(item) {
            this.selectedSubscription = item;
            this.payModal.show();
        },
        deleteSubscription(item) {
            this.$swal({
                title: this.$t('subscriptionList.messages.areYouSureDelete'),
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: this.$t('common.yes'),
                cancelButtonText: this.$t('common.no'),
            }).then(async (result) => {
                if (!result.isConfirmed) return;
                try {
                    const response = await subscriptionService.deleteSubscription(item.id);
                    if (response.status !== 200) {
                        this.$swal({ icon: 'error', title: this.$t('subscriptionList.messages.deleteError') });
                        return;
                    }
                    this.$swal({ icon: 'success', title: this.$t('subscriptionList.messages.deleteSuccess'), timer: 1500, showConfirmButton: false });
                    await this.loadSubscriptions();
                } catch (e) {
                    this.$swal({ icon: 'error', title: this.$t('subscriptionList.messages.deleteError') });
                }
            });
        },
        formatDate(date) {
            return moment(date).locale(this.$i18n.locale).format('D MMMM YYYY');
        },
        formatAmount(item) {
            if (item.amount == null) return this.$t('subscriptionList.amountUndetermined');
            return new Intl.NumberFormat('tr-TR', {
                style: 'currency',
                currency: item.currency?.code,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(item.amount);
        },
        formatFrequency(item) {
            const freqText = this.frequencies.find(f => f.value === item.frequency)?.text || '';
            if ([4, 5, 6].includes(item.frequency)) return freqText;
            if (item.frequency === 7) return `${freqText} · ${item.interval}`;
            return `${freqText} · ${item.interval}`;
        },
        statusLabel(status) {
            switch (status) {
                case 'Paid': return this.$t('subscriptionList.tabs.paid');
                case 'Overdue': return this.$t('subscriptionList.tabs.overdue');
                case 'Upcoming': return this.$t('subscriptionList.tabs.upcoming');
                default: return '';
            }
        },
    },
    mounted() {
        const modalElement = document.getElementById('subscriptionModal');
        if (modalElement) {
            this.modal = new bootstrap.Modal(modalElement, { backdrop: 'static', keyboard: false });
        }
        const payModalElement = document.getElementById('subscriptionPayModal');
        if (payModalElement) {
            this.payModal = new bootstrap.Modal(payModalElement, { backdrop: 'static', keyboard: false });
        }

        this.loadSubscriptions();

        if (this.$store.state.dashboard.pendingOpenSubscriptionModal) {
            this.$store.dispatch('dashboard/setPendingOpenSubscriptionModal', false);
            this.$nextTick(() => this.openCreateModal());
        }
    },
    beforeUnmount() {
        if (this.modal?.hide) {
            this.modal.hide();
            this.modal.dispose();
        }
        if (this.payModal?.hide) {
            this.payModal.hide();
            this.payModal.dispose();
        }
    },
}
</script>

<style scoped>
.sub-header-icon {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: linear-gradient(135deg, #10b981, #059669);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    flex-shrink: 0;
}

/* ── Tabs ────────────────────────────────────────────────────────── */
.sub-tab-bar {
    display: flex;
    gap: 6px;
    padding: 10px 20px;
    background: #f9fafb;
    border-bottom: 1.5px solid #e5e7eb;
    flex-wrap: wrap;
}

.sub-tab {
    padding: 6px 16px;
    border-radius: 20px;
    border: 1.5px solid #e5e7eb;
    background: #fff;
    color: #6b7280;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
}

.sub-tab:hover {
    border-color: #10b981;
    color: #10b981;
}

.sub-tab.active {
    border-color: #10b981;
    background: #10b981;
    color: #fff;
}

/* ── Body / states ───────────────────────────────────────────────── */
.sub-body {
    padding: 18px 20px;
}

.state-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 24px;
    gap: 6px;
    color: #9ca3af;
}

.state-icon {
    font-size: 30px;
    margin-bottom: 6px;
}

.state-text {
    font-size: 14px;
    font-weight: 600;
    color: #6b7280;
}

/* ── Card grid ───────────────────────────────────────────────────── */
.sub-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(255px, 1fr));
    gap: 14px;
}

.sub-tile {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: #fff;
    border: 1px solid #eef0f2;
    border-left: 4px solid var(--accent, #d1d5db);
    border-radius: 14px;
    padding: 16px;
    transition: box-shadow 0.15s, transform 0.15s;
}

.sub-tile:hover {
    box-shadow: 0 6px 16px rgba(16, 24, 40, 0.08);
    transform: translateY(-2px);
}

.sub-tile.accent-paid { --accent: #10b981; }
.sub-tile.accent-overdue { --accent: #ef4444; }
.sub-tile.accent-upcoming { --accent: #f59e0b; }
.sub-tile.accent-none { --accent: #d1d5db; }

.sub-tile-actions {
    position: absolute;
    top: 14px;
    right: 14px;
    display: flex;
    align-items: center;
    gap: 3px;
    padding: 3px;
    background: #fff;
    border: 1px solid #eef0f2;
    border-radius: 9px;
    box-shadow: 0 4px 10px rgba(16, 24, 40, 0.12);
    opacity: 0;
    pointer-events: none;
    transform: translateY(-4px);
    transition: opacity 0.15s, transform 0.15s;
    z-index: 2;
}

.sub-tile:hover .sub-tile-actions,
.sub-tile:focus-within .sub-tile-actions {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0);
}

.sub-tile-header {
    display: flex;
    align-items: center;
}

.sub-tile-icon {
    width: 38px;
    height: 38px;
    border-radius: 11px;
    background: color-mix(in srgb, var(--accent, #d1d5db) 16%, #fff);
    color: var(--accent, #9ca3af);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    flex-shrink: 0;
}

.sub-tile-name {
    font-weight: 700;
    font-size: 15px;
    color: #111827;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.sub-freq-badge {
    font-weight: 600;
    align-self: flex-start;
}

.sub-tile-next {
    font-size: 12.5px;
    color: #6b7280;
}

.sub-tile-labels {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

.sub-tile-labels .badge {
    font-size: 10.5px;
    color: #fff;
}

.sub-tile-footer {
    margin-top: auto;
    padding-top: 8px;
    border-top: 1px dashed #f1f3f5;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
}

.sub-tile-amount {
    font-weight: 700;
    font-size: 16px;
    color: #111827;
}

.sub-amount-muted {
    font-weight: 500;
    color: #9ca3af;
    font-size: 14px;
}

.sub-icon-btn {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    border: none;
    background: #f3f4f6;
    color: #6b7280;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.15s;
}

.sub-icon-btn.pay:hover { background: #ecfdf5; color: #059669; }
.sub-icon-btn.edit:hover { background: #fffbeb; color: #d97706; }
.sub-icon-btn.danger:hover { background: #fef2f2; color: #dc2626; }

.status-badge {
    font-weight: 700;
    font-size: 11px;
}

.status-paid { background: #10b981; color: #fff; }
.status-overdue { background: #ef4444; color: #fff; }
.status-upcoming { background: #f59e0b; color: #fff; }

/* ── Pagination ──────────────────────────────────────────────────── */
.sub-pagination {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 16px;
}

.sub-pagination-info {
    font-size: 12.5px;
    color: #6b7280;
}

.sub-pagination-nav {
    display: flex;
    gap: 4px;
}

.sub-page-btn {
    width: 28px;
    height: 28px;
    border-radius: 7px;
    border: 1.5px solid #e5e7eb;
    background: #fff;
    color: #374151;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.15s;
}

.sub-page-btn:hover:not(:disabled) {
    border-color: #10b981;
    color: #10b981;
}

.sub-page-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

@media (max-width: 640px) {
    .sub-grid {
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    }
}
</style>
