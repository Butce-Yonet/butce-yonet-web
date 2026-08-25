<template>
  <div class="container-fluid pt-4">

    <!-- Card wrapper -->
    <div class="card border-0 labels-card">

      <!-- Header -->
      <div class="labels-header">
        <div class="labels-header-left">
          <div class="labels-header-icon">
            <i class="fa fa-tags"></i>
          </div>
          <div>
            <h5 class="labels-title">
              {{ $t('labelsPage.title') }}
              <span v-if="!labelsLoading" class="labels-count">{{ labels.length }}</span>
            </h5>
          </div>
        </div>
        <div class="labels-header-right">
          <div class="search-wrap">
            <i class="fa fa-search search-icon"></i>
            <input
              class="search-input"
              v-model="searchQuery"
              :placeholder="$t('labelsPage.searchPlaceholder')"
            />
          </div>
          <button class="labels-add-btn" @click="openCreateModal">
            <i class="fa fa-plus"></i>
            {{ $t('labelsPage.addButton') }}
          </button>
        </div>
      </div>

      <!-- Body -->
      <div class="card-body labels-body">

        <!-- Loading -->
        <div v-if="labelsLoading" class="state-box">
          <div class="spinner-border text-success"></div>
        </div>

        <!-- Empty (no data at all) -->
        <div v-else-if="labels.length === 0" class="state-box">
          <i class="fa fa-tags state-icon"></i>
          <span class="state-text">{{ $t('labelsPage.emptyTitle') }}</span>
          <span class="state-sub">{{ $t('labelsPage.emptySub') }}</span>
          <button class="btn btn-success btn-sm mt-3" @click="openCreateModal">
            <i class="fa fa-plus me-1"></i>{{ $t('labelsPage.addButton') }}
          </button>
        </div>

        <!-- No search results -->
        <div v-else-if="filteredLabels.length === 0" class="state-box">
          <i class="fa fa-search state-icon"></i>
          <span class="state-text">{{ $t('labelsPage.noSearchResults') }}</span>
        </div>

        <!-- Label grid -->
        <div v-else class="label-grid">
          <div
            v-for="label in filteredLabels"
            :key="label.id"
            class="label-card"
            :style="{ '--label-color': label.colorCode }"
          >
            <div class="label-card-actions">
              <button
                class="label-icon-btn"
                v-tooltip="$t('common.tooltips.edit')"
                @click="openEditModal(label)"
              >
                <i class="fa fa-pencil"></i>
              </button>
              <button
                class="label-icon-btn danger"
                v-tooltip="$t('common.tooltips.delete')"
                @click="deleteLabel(label)"
              >
                <i class="fa fa-trash"></i>
              </button>
            </div>
            <span class="label-card-swatch"></span>
            <div class="label-card-name" :title="label.name">{{ label.name }}</div>
            <code class="label-card-code">{{ label.colorCode }}</code>
          </div>

          <button type="button" class="label-card label-card-add" @click="openCreateModal">
            <i class="fa fa-plus"></i>
            <span>{{ $t('labelsPage.addButton') }}</span>
          </button>
        </div>

      </div>
    </div>

    <!-- Add / Edit Modal -->
    <Teleport to="body">
    <div class="modal fade" id="labelFormModal" tabindex="-1" role="dialog" ref="labelFormModal">
      <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content border-0 shadow-lg" style="border-radius:16px">

          <div class="modal-header border-0 pb-0 px-4 pt-4">
            <div class="d-flex align-items-center gap-3">
              <div class="modal-icon-wrap" :style="{ background: modalForm.colorCode }">
                <i :class="modalMode === 'edit' ? 'fa fa-pencil' : 'fa fa-plus'"></i>
              </div>
              <div>
                <p class="text-muted mb-0 small">
                  {{ modalMode === 'edit' ? $t('labelsPage.modal.editSubtitle') : $t('labelsPage.modal.createSubtitle') }}
                </p>
                <h5 class="modal-title mb-0 fw-semibold">
                  {{ modalForm.name || (modalMode === 'edit' ? $t('labelsPage.modal.editSubtitle') : $t('labelsPage.addButton')) }}
                </h5>
              </div>
            </div>
            <button class="btn-close" type="button" @click="closeModal"></button>
          </div>

          <div class="modal-body px-4 pt-4 pb-4">
            <form novalidate @submit.prevent="saveLabel">
              <div class="row g-4">

                <!-- Name -->
                <div class="col-12 col-md-7">
                  <label class="form-label fw-semibold text-secondary small text-uppercase">
                    {{ $t('labelsPage.form.namePlaceholder') }}
                  </label>
                  <input
                    class="form-control form-control-lg"
                    :class="{ 'is-invalid': modalFormErrors.name }"
                    v-model="modalForm.name"
                    :placeholder="$t('labelsPage.form.namePlaceholder')"
                    ref="nameInput"
                    autocomplete="off"
                  />
                  <div class="invalid-feedback">{{ modalFormErrors.name }}</div>
                </div>

                <!-- Color -->
                <div class="col-12 col-md-5">
                  <label class="form-label fw-semibold text-secondary small text-uppercase">
                    {{ $t('labelsPage.form.colorPlaceholder') }}
                  </label>
                  <div class="d-flex align-items-center gap-3">
                    <input
                      class="form-control form-control-color"
                      v-model="modalForm.colorCode"
                      type="color"
                      style="width:52px; height:46px; padding:3px 5px; border-radius:8px; cursor:pointer; flex-shrink:0"
                    />
                    <input
                      class="form-control form-control-lg"
                      v-model="modalForm.colorCode"
                      placeholder="#10b981"
                      maxlength="7"
                    />
                  </div>
                </div>

                <!-- Preview -->
                <div class="col-12">
                  <label class="form-label fw-semibold text-secondary small text-uppercase">
                    {{ $t('labelsPage.form.preview') }}
                  </label>
                  <div class="preview-box">
                    <span
                      class="preview-chip"
                      :style="{
                        background: modalForm.colorCode + '1a',
                        color: modalForm.colorCode,
                        borderColor: modalForm.colorCode + '55'
                      }"
                    >
                      <span class="preview-dot" :style="{ background: modalForm.colorCode }"></span>
                      {{ modalForm.name || $t('labelsPage.form.namePlaceholder') }}
                    </span>
                  </div>
                </div>

              </div>

              <div class="d-flex gap-2 justify-content-end mt-4">
                <button type="button" class="btn btn-light px-5" @click="closeModal">
                  {{ $t('common.cancel') }}
                </button>
                <button
                  type="submit"
                  class="btn btn-success px-5"
                  :disabled="modalFormSubmitting"
                >
                  <span v-if="modalFormSubmitting" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="fa fa-save me-2"></i>
                  {{ $t('common.save') }}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
    </Teleport>

  </div>
</template>

<script>
import * as bootstrap from 'bootstrap';
import userLabelService from '@/services/user.label.service';
import * as yup from 'yup';
import { createYupValidator } from '@/services/validator.service';

export default {
  name: 'LabelsPage',
  data() {
    return {
      labels: [],
      labelsLoading: false,
      searchQuery: '',
      modalMode: 'create',
      modalForm: { id: null, name: '', colorCode: '#10b981' },
      modalFormErrors: {},
      modalFormSubmitting: false,
      modalFormValidator: null,
      bsModal: null,
    };
  },
  computed: {
    filteredLabels() {
      const q = this.searchQuery.trim().toLowerCase();
      if (!q) return this.labels;
      return this.labels.filter(l => l.name.toLowerCase().includes(q));
    },
  },
  watch: {
    '$store.state.dashboard.pendingOpenLabelModal'(val) {
      if (!val) return;
      this.$store.dispatch('dashboard/setPendingOpenLabelModal', false);
      this.openCreateModal();
    },
  },
  methods: {
    async loadLabels() {
      this.labelsLoading = true;
      try {
        const response = await userLabelService.getUserLabels();
        if (response.status === 200) {
          this.labels = (response.data.data || []).map(item => ({
            id: item.id,
            name: item.name,
            colorCode: item.colorCode || '#10b981',
          }));
        } else {
          this.$swal({ title: this.$t('labelsPage.messages.loadError'), icon: 'error' });
        }
      } catch {
        this.$swal({ title: this.$t('labelsPage.messages.loadError'), icon: 'error' });
      } finally {
        this.labelsLoading = false;
      }
    },
    openCreateModal() {
      this.modalMode = 'create';
      this.modalForm = { id: null, name: '', colorCode: '#10b981' };
      this.modalFormErrors = {};
      this.bsModal.show();
      this.$nextTick(() => this.$refs.nameInput?.focus());
    },
    openEditModal(label) {
      this.modalMode = 'edit';
      this.modalForm = { id: label.id, name: label.name, colorCode: label.colorCode };
      this.modalFormErrors = {};
      this.bsModal.show();
      this.$nextTick(() => this.$refs.nameInput?.focus());
    },
    closeModal() {
      this.bsModal.hide();
    },
    async saveLabel() {
      const isValid = await this.modalFormValidator.validateForm(this.modalForm, this.modalFormErrors);
      if (!isValid) return;

      this.modalFormSubmitting = true;
      try {
        const response = this.modalMode === 'create'
          ? await userLabelService.createUserLabel({ name: this.modalForm.name, colorCode: this.modalForm.colorCode })
          : await userLabelService.updateUserLabel({ id: this.modalForm.id, name: this.modalForm.name, colorCode: this.modalForm.colorCode });

        if (response.status === 200) {
          this.closeModal();
          await this.loadLabels();
          this.$store.dispatch('dashboard/setLabels', this.labels);
          const key = this.modalMode === 'create' ? 'createSuccess' : 'editSuccess';
          this.$swal({ title: this.$t(`labelsPage.messages.${key}`), icon: 'success', timer: 1500, showConfirmButton: false });
        } else {
          const key = this.modalMode === 'create' ? 'createError' : 'editError';
          this.$swal({ title: this.$t(`labelsPage.messages.${key}`), icon: 'error' });
        }
      } catch {
        const key = this.modalMode === 'create' ? 'createError' : 'editError';
        this.$swal({ title: this.$t(`labelsPage.messages.${key}`), icon: 'error' });
      } finally {
        this.modalFormSubmitting = false;
      }
    },
    deleteLabel(label) {
      this.$swal({
        title: this.$t('labelsPage.messages.areYouSureDelete'),
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: this.$t('common.yes'),
        cancelButtonText: this.$t('common.no'),
      }).then(async result => {
        if (!result.isConfirmed) return;
        try {
          const response = await userLabelService.deleteUserLabel(label.id);
          if (response.status === 200) {
            await this.loadLabels();
            this.$store.dispatch('dashboard/setLabels', this.labels);
            this.$swal({ title: this.$t('labelsPage.messages.deleteSuccess'), icon: 'success', timer: 1500, showConfirmButton: false });
          } else {
            this.$swal({ title: this.$t('labelsPage.messages.deleteError'), icon: 'error' });
          }
        } catch {
          this.$swal({ title: this.$t('labelsPage.messages.deleteError'), icon: 'error' });
        }
      });
    },
  },
  mounted() {
    this.bsModal = new bootstrap.Modal(this.$refs.labelFormModal, { backdrop: 'static', keyboard: false });
    this.loadLabels();

    if (this.$store.state.dashboard.pendingOpenLabelModal) {
      this.$store.dispatch('dashboard/setPendingOpenLabelModal', false);
      this.$nextTick(() => this.openCreateModal());
    }
  },
  created() {
    const schema = yup.object({
      name: yup.string().required(this.$t('validation.message.required')),
    });
    this.modalFormValidator = createYupValidator(schema);
  },
};
</script>

<style scoped>
.labels-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(16, 24, 40, 0.06), 0 1px 2px rgba(16, 24, 40, 0.04);
}

/* ── Header ──────────────────────────────────────────────────────── */
.labels-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f3f5;
}

.labels-header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.labels-header-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.28);
}

.labels-title {
  margin: 0;
  font-size: 19px;
  font-weight: 700;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 8px;
}

.labels-count {
  font-size: 12px;
  font-weight: 700;
  color: #059669;
  background: #ecfdf5;
  padding: 2px 10px;
  border-radius: 20px;
}

.labels-header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* ── Search ──────────────────────────────────────────────────────── */
.search-wrap {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #9ca3af;
  pointer-events: none;
}

.search-input {
  padding: 9px 14px 9px 34px;
  min-width: 220px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-size: 13.5px;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.search-input:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12);
}

.labels-add-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  font-weight: 600;
  font-size: 13.5px;
  padding: 9px 18px;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 3px 8px rgba(16, 185, 129, 0.28);
  transition: transform 0.15s, box-shadow 0.15s;
  white-space: nowrap;
}

.labels-add-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 5px 12px rgba(16, 185, 129, 0.35);
}

.labels-body {
  padding: 20px 24px;
}

/* ── Label grid ──────────────────────────────────────────────────── */
.label-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 14px;
}

.label-card {
  position: relative;
  background: #fff;
  border: 1px solid #eef0f2;
  border-left: 4px solid var(--label-color, #10b981);
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: box-shadow 0.15s, transform 0.15s;
}

.label-card:hover {
  box-shadow: 0 6px 16px rgba(16, 24, 40, 0.08);
  transform: translateY(-2px);
}

.label-card-swatch {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: var(--label-color);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.14);
}

.label-card-name {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.label-card-code {
  font-size: 11px;
  color: #9ca3af;
  background: #f9fafb;
  padding: 2px 7px;
  border-radius: 5px;
  align-self: flex-start;
  letter-spacing: 0.02em;
}

.label-card-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transform: translateY(-2px);
  transition: opacity 0.15s, transform 0.15s;
}

.label-card:hover .label-card-actions,
.label-card:focus-within .label-card-actions {
  opacity: 1;
  transform: translateY(0);
}

.label-icon-btn {
  width: 26px;
  height: 26px;
  border-radius: 7px;
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

.label-icon-btn:hover {
  background: #e5e7eb;
  color: #111827;
}

.label-icon-btn.danger:hover {
  background: #fef2f2;
  color: #dc2626;
}

.label-card-add {
  border: 1.5px dashed #d1d5db;
  background: #fafafa;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-weight: 600;
  font-size: 13.5px;
  cursor: pointer;
  gap: 6px;
  min-height: 96px;
}

.label-card-add i {
  font-size: 16px;
}

.label-card-add:hover {
  border-color: #10b981;
  color: #059669;
  background: #ecfdf5;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .labels-header {
    padding: 16px 18px;
  }
  .labels-body {
    padding: 16px 18px;
  }
  .search-input {
    min-width: 0;
    width: 100%;
  }
  .labels-header-right {
    width: 100%;
  }
  .search-wrap {
    flex: 1;
  }
  .label-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}

/* ── State boxes ─────────────────────────────────────────────────── */
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
  font-size: 32px;
  margin-bottom: 8px;
}

.state-text {
  font-size: 15px;
  font-weight: 600;
  color: #374151;
}

.state-sub {
  font-size: 13px;
}

/* ── Modal ───────────────────────────────────────────────────────── */
.modal-icon-wrap {
  width: 42px;
  height: 42px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
  flex-shrink: 0;
  transition: background 0.2s;
}

.preview-box {
  padding: 16px 20px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
}

.preview-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 16px;
  border-radius: 20px;
  border: 1.5px solid;
  font-size: 14px;
  font-weight: 700;
}

.preview-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}
</style>
