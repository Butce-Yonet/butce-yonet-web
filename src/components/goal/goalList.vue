<template>
    <div class="card border-0 goal-card">
        <div class="goal-header">
            <div class="goal-header-left">
                <div class="goal-header-icon">
                    <i class="fa fa-bullseye"></i>
                </div>
                <h5 class="goal-title">{{ $t('goalList.title') }}</h5>
            </div>
            <button class="goal-add-btn" @click="openCreateModal">
                <i class="fa fa-plus"></i>
                {{ $t('goalList.addButton') }}
            </button>
        </div>

        <div v-if="metrics" class="goal-summary">
            <div class="goal-summary-chip chip-active">
                <i class="fa fa-bullseye"></i>
                <div>
                    <div class="chip-label">{{ $t('goalList.metrics.activeCount') }}</div>
                    <div class="chip-value">{{ metrics.activeGoalCount }}</div>
                </div>
            </div>
            <div class="goal-summary-chip chip-completed">
                <i class="fa fa-check"></i>
                <div>
                    <div class="chip-label">{{ $t('goalList.metrics.completedCount') }}</div>
                    <div class="chip-value">{{ metrics.completedGoalCount }}</div>
                </div>
            </div>
            <div class="goal-summary-chip chip-target">
                <i class="fa fa-flag"></i>
                <div>
                    <div class="chip-label">{{ $t('goalList.metrics.totalTarget') }}</div>
                    <div class="chip-value">{{ formatMetricAmount(metrics.totalTargetAmount) }}</div>
                </div>
            </div>
            <div class="goal-summary-chip chip-saved">
                <i class="fa fa-line-chart"></i>
                <div>
                    <div class="chip-label">{{ $t('goalList.metrics.totalSaved') }}</div>
                    <div class="chip-value">{{ formatMetricAmount(metrics.totalSavedAmount) }}</div>
                </div>
            </div>
        </div>

        <!-- Status tabs -->
        <div class="goal-tab-bar">
            <button
                v-for="tab in tabs"
                :key="tab.key"
                class="goal-tab"
                :class="{ active: activeTab === tab.key }"
                @click="selectTab(tab.key)"
            >
                {{ tab.text }}
            </button>
        </div>

        <div class="card-body goal-body">

            <div v-if="loading" class="state-box">
                <div class="spinner-border text-success"></div>
            </div>

            <div v-else-if="goals.length === 0" class="state-box">
                <i class="fa fa-bullseye state-icon"></i>
                <span class="state-text">{{ $t('common.noDataText') }}</span>
            </div>

            <div v-else class="goal-grid">
                <div
                    v-for="item in goals"
                    :key="item.id"
                    class="goal-tile"
                    :class="{ 'is-completed': item.isCompleted }"
                >
                    <div class="goal-tile-actions">
                        <button class="goal-icon-btn contribute" v-tooltip="$t('goalList.tooltips.contribute')" @click="openContributeModal(item)">
                            <i class="fa fa-plus"></i>
                        </button>
                        <button class="goal-icon-btn edit" v-tooltip="$t('common.tooltips.edit')" @click="openEditModal(item)">
                            <i class="fa fa-pencil"></i>
                        </button>
                        <button class="goal-icon-btn danger" v-tooltip="$t('common.tooltips.delete')" @click="deleteGoal(item)">
                            <i class="fa fa-trash"></i>
                        </button>
                    </div>

                    <div class="goal-tile-header">
                        <span class="goal-tile-icon"><i class="fa fa-bullseye"></i></span>
                    </div>

                    <div class="goal-tile-name" :title="item.name">{{ item.name }}</div>

                    <div class="goal-progress-track">
                        <div class="goal-progress-fill" :style="{ width: Math.min(100, item.progressPercent) + '%' }"></div>
                    </div>
                    <div class="goal-progress-text">
                        <span class="goal-progress-percent">{{ formatPercent(item.progressPercent) }}%</span>
                        <span class="goal-progress-amounts">
                            {{ formatCurrency(item.currentAmount, item.currency?.code) }}
                            / {{ formatCurrency(item.targetAmount, item.currency?.code) }}
                        </span>
                    </div>

                    <div class="goal-tile-deadline">
                        <i class="fa fa-calendar me-1"></i>
                        {{ item.deadline ? formatDate(item.deadline) : $t('goalList.noDeadline') }}
                    </div>

                    <div class="goal-tile-labels" v-if="item.labels && item.labels.length > 0">
                        <span v-for="label in item.labels" :key="label.id" class="badge"
                            :style="{ backgroundColor: label.colorCode }">
                            {{ label.name }}
                        </span>
                    </div>

                    <div class="goal-tile-footer">
                        <span class="goal-tile-remaining">
                            {{ $t('goalList.card.remaining') }}: {{ formatCurrency(item.remainingAmount, item.currency?.code) }}
                        </span>
                        <span v-if="item.isCompleted" class="badge goal-completed-badge">
                            {{ $t('goalList.completedBadge') }}
                        </span>
                    </div>
                </div>
            </div>

            <div v-if="!loading && goals.length > 0" class="goal-pagination">
                <span class="goal-pagination-info">{{ pageInfoText }}</span>
                <div class="goal-pagination-nav">
                    <button class="goal-page-btn" :disabled="serverOptions.page <= 1" @click="prevPage">
                        <i class="fa fa-chevron-left"></i>
                    </button>
                    <button class="goal-page-btn" :disabled="serverOptions.page >= totalPages" @click="nextPage">
                        <i class="fa fa-chevron-right"></i>
                    </button>
                </div>
            </div>

        </div>
    </div>

    <Teleport to="body">
        <goal-modal
            :mode="modalMode"
            :goalData="selectedGoal"
            :modal="modal"
            @saved="onGoalSaved"
        ></goal-modal>
        <goal-contribute-modal
            :goal="selectedGoal"
            :modal="contributeModal"
            @saved="onGoalSaved"
        ></goal-contribute-modal>
    </Teleport>
</template>

<script>
import goalModal from './goalModal.vue';
import goalContributeModal from './goalContributeModal.vue';
import * as bootstrap from 'bootstrap';
import goalService from '@/services/goal.service';
import moment from 'moment';

export default {
    components: {
        'goal-modal': goalModal,
        'goal-contribute-modal': goalContributeModal,
    },
    data() {
        return {
            loading: false,
            activeTab: 'All',
            goals: [],
            metrics: null,
            itemsLength: 0,
            serverOptions: {
                page: 1,
                rowsPerPage: 12,
            },
            modal: {},
            contributeModal: {},
            modalMode: 'create',
            selectedGoal: null,
        };
    },
    computed: {
        tabs() {
            return [
                { key: 'All', text: this.$t('goalList.tabs.all') },
                { key: 'Active', text: this.$t('goalList.tabs.active') },
                { key: 'Completed', text: this.$t('goalList.tabs.completed') },
            ];
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
        '$store.state.dashboard.openGoalModalTrigger'() {
            this.openCreateModal();
        },
    },
    methods: {
        prevPage() {
            if (this.serverOptions.page > 1) {
                this.serverOptions.page--;
                this.loadGoals();
            }
        },
        nextPage() {
            if (this.serverOptions.page < this.totalPages) {
                this.serverOptions.page++;
                this.loadGoals();
            }
        },
        selectTab(key) {
            if (this.activeTab === key) return;
            this.activeTab = key;
            this.serverOptions.page = 1;
            this.loadGoals();
        },
        async loadGoals() {
            this.loading = true;
            const queryParams = {
                PageNumber: this.serverOptions.page,
                PageSize: this.serverOptions.rowsPerPage,
            };
            if (this.activeTab === 'Active') queryParams.IsCompleted = false;
            if (this.activeTab === 'Completed') queryParams.IsCompleted = true;

            try {
                const response = await goalService.getAllGoals(queryParams);
                if (response.status !== 200) {
                    this.$swal('Error', this.$t('goalList.messages.loadError'), 'error');
                    return;
                }
                this.itemsLength = response.data.data.totalRecords;
                this.goals = response.data.data.items;
            } catch (e) {
                this.$swal('Error', this.$t('goalList.messages.loadError'), 'error');
            } finally {
                this.loading = false;
            }
        },
        async loadMetrics() {
            try {
                const response = await goalService.getGoalMetrics();
                if (response.status === 200) {
                    this.metrics = response.data.data;
                }
            } catch (e) {
                this.$swal('Error', this.$t('goalList.messages.metricsLoadError'), 'error');
            }
        },
        onGoalSaved() {
            this.loadGoals();
            this.loadMetrics();
        },
        openCreateModal() {
            this.modalMode = 'create';
            this.selectedGoal = null;
            this.modal.show();
        },
        openEditModal(item) {
            this.modalMode = 'edit';
            this.selectedGoal = item;
            this.modal.show();
        },
        openContributeModal(item) {
            this.selectedGoal = item;
            this.contributeModal.show();
        },
        deleteGoal(item) {
            this.$swal({
                title: this.$t('goalList.messages.areYouSureDelete'),
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: this.$t('common.yes'),
                cancelButtonText: this.$t('common.no'),
            }).then(async (result) => {
                if (!result.isConfirmed) return;
                try {
                    const response = await goalService.deleteGoal(item.id);
                    if (response.status !== 200) {
                        this.$swal({ icon: 'error', title: this.$t('goalList.messages.deleteError') });
                        return;
                    }
                    this.$swal({ icon: 'success', title: this.$t('goalList.messages.deleteSuccess'), timer: 1500, showConfirmButton: false });
                    this.onGoalSaved();
                } catch (e) {
                    this.$swal({ icon: 'error', title: this.$t('goalList.messages.deleteError') });
                }
            });
        },
        formatDate(date) {
            return moment(date).locale(this.$i18n.locale).format('D MMMM YYYY');
        },
        formatPercent(value) {
            if (value == null) return '0';
            return Number.isInteger(value) ? value : value.toFixed(1);
        },
        formatCurrency(amount, currencyCode) {
            if (amount == null || !currencyCode) return '';
            return new Intl.NumberFormat('tr-TR', {
                style: 'currency',
                currency: currencyCode,
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }).format(amount);
        },
        formatMetricAmount(value) {
            if (value == null) return '';
            if (this.metrics?.currency?.code) {
                return this.formatCurrency(value, this.metrics.currency.code);
            }
            return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
        },
    },
    mounted() {
        const modalElement = document.getElementById('goalModal');
        if (modalElement) {
            this.modal = new bootstrap.Modal(modalElement, { backdrop: 'static', keyboard: false });
        }
        const contributeModalElement = document.getElementById('goalContributeModal');
        if (contributeModalElement) {
            this.contributeModal = new bootstrap.Modal(contributeModalElement, { backdrop: 'static', keyboard: false });
        }

        this.loadGoals();
        this.loadMetrics();

        if (this.$store.state.dashboard.pendingOpenGoalModal) {
            this.$store.dispatch('dashboard/setPendingOpenGoalModal', false);
            this.$nextTick(() => this.openCreateModal());
        }
    },
    beforeUnmount() {
        if (this.modal?.hide) {
            this.modal.hide();
            this.modal.dispose();
        }
        if (this.contributeModal?.hide) {
            this.contributeModal.hide();
            this.contributeModal.dispose();
        }
    },
}
</script>

<style scoped>
.goal-card {
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(16, 24, 40, 0.06), 0 1px 2px rgba(16, 24, 40, 0.04);
}

/* ── Header ──────────────────────────────────────────────────────── */
.goal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    padding: 20px 24px;
    border-bottom: 1px solid #f1f3f5;
}

.goal-header-left {
    display: flex;
    align-items: center;
    gap: 14px;
}

.goal-header-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
    box-shadow: 0 4px 10px rgba(59, 130, 246, 0.28);
}

.goal-title {
    margin: 0;
    font-size: 19px;
    font-weight: 700;
    color: #111827;
}

.goal-add-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: none;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: #fff;
    font-weight: 600;
    font-size: 13.5px;
    padding: 9px 18px;
    border-radius: 10px;
    cursor: pointer;
    box-shadow: 0 3px 8px rgba(59, 130, 246, 0.28);
    transition: transform 0.15s, box-shadow 0.15s;
}

.goal-add-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 5px 12px rgba(59, 130, 246, 0.35);
}

/* ── Summary chips ───────────────────────────────────────────────── */
.goal-summary {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding: 14px 24px;
    background: #f9fafb;
    border-bottom: 1.5px solid #e5e7eb;
}

.goal-summary-chip {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #fff;
    border: 1px solid #eef0f2;
    border-radius: 12px;
    padding: 8px 14px;
    flex: 1 1 170px;
}

.goal-summary-chip i {
    width: 30px;
    height: 30px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    flex-shrink: 0;
}

.chip-active i { background: #eff6ff; color: #2563eb; }
.chip-completed i { background: #ecfdf5; color: #059669; }
.chip-target i { background: #fff7ed; color: #d97706; }
.chip-saved i { background: #eef2ff; color: #4f46e5; }

.chip-label {
    font-size: 10.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #9ca3af;
}

.chip-value {
    font-size: 14px;
    font-weight: 700;
    color: #111827;
}

/* ── Tabs ────────────────────────────────────────────────────────── */
.goal-tab-bar {
    display: flex;
    gap: 6px;
    padding: 10px 20px;
    background: #fff;
    border-bottom: 1.5px solid #e5e7eb;
    flex-wrap: wrap;
}

.goal-tab {
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

.goal-tab:hover {
    border-color: #3b82f6;
    color: #3b82f6;
}

.goal-tab.active {
    border-color: #3b82f6;
    background: #3b82f6;
    color: #fff;
}

/* ── Body / states ───────────────────────────────────────────────── */
.goal-body {
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
.goal-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(255px, 1fr));
    gap: 14px;
}

.goal-tile {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: #fff;
    border: 1px solid #eef0f2;
    border-left: 4px solid #3b82f6;
    border-radius: 14px;
    padding: 16px;
    transition: box-shadow 0.15s, transform 0.15s;
}

.goal-tile:hover {
    box-shadow: 0 6px 16px rgba(16, 24, 40, 0.08);
    transform: translateY(-2px);
}

.goal-tile.is-completed {
    border-left-color: #10b981;
}

.goal-tile-actions {
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

.goal-tile:hover .goal-tile-actions,
.goal-tile:focus-within .goal-tile-actions {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0);
}

.goal-tile-header {
    display: flex;
    align-items: center;
}

.goal-tile-icon {
    width: 38px;
    height: 38px;
    border-radius: 11px;
    background: #eff6ff;
    color: #3b82f6;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    flex-shrink: 0;
}

.goal-tile.is-completed .goal-tile-icon {
    background: #ecfdf5;
    color: #10b981;
}

.goal-tile-name {
    font-weight: 700;
    font-size: 15px;
    color: #111827;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.goal-progress-track {
    height: 8px;
    border-radius: 5px;
    background: #f1f3f5;
    overflow: hidden;
}

.goal-progress-fill {
    height: 100%;
    border-radius: 5px;
    background: linear-gradient(90deg, #3b82f6, #2563eb);
    transition: width 0.3s ease;
}

.goal-tile.is-completed .goal-progress-fill {
    background: linear-gradient(90deg, #10b981, #059669);
}

.goal-progress-text {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
    font-size: 12px;
}

.goal-progress-percent {
    font-weight: 700;
    color: #111827;
}

.goal-progress-amounts {
    color: #6b7280;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.goal-tile-deadline {
    font-size: 12.5px;
    color: #6b7280;
}

.goal-tile-labels {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

.goal-tile-labels .badge {
    font-size: 10.5px;
    color: #fff;
}

.goal-tile-footer {
    margin-top: auto;
    padding-top: 8px;
    border-top: 1px dashed #f1f3f5;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
}

.goal-tile-remaining {
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
}

.goal-completed-badge {
    background: #10b981;
    color: #fff;
    font-weight: 700;
    font-size: 10.5px;
}

.goal-icon-btn {
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

.goal-icon-btn.contribute:hover { background: #eff6ff; color: #2563eb; }
.goal-icon-btn.edit:hover { background: #fffbeb; color: #d97706; }
.goal-icon-btn.danger:hover { background: #fef2f2; color: #dc2626; }

/* ── Pagination ──────────────────────────────────────────────────── */
.goal-pagination {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 16px;
}

.goal-pagination-info {
    font-size: 12.5px;
    color: #6b7280;
}

.goal-pagination-nav {
    display: flex;
    gap: 4px;
}

.goal-page-btn {
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

.goal-page-btn:hover:not(:disabled) {
    border-color: #3b82f6;
    color: #3b82f6;
}

.goal-page-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

@media (max-width: 640px) {
    .goal-grid {
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    }
}
</style>
