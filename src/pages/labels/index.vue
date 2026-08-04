<template>
  <div class="container-fluid pt-4">

    <!-- Card wrapper -->
    <div class="card border mt-3">

      <!-- Card Header -->
      <div class="card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div class="d-flex align-items-center gap-2">
          <h5 class="mb-0">
            <i class="fa fa-tags me-2 text-success"></i>
            {{ $t('labelsPage.title') }}
          </h5>
          <span v-if="!labelsLoading" class="badge badge-light-success">{{ labels.length }}</span>
        </div>
        <div class="d-flex align-items-center gap-2">
          <div class="search-wrap">
            <i class="fa fa-search search-icon"></i>
            <input
              class="form-control form-control-sm search-input"
              v-model="searchQuery"
              :placeholder="$t('labelsPage.searchPlaceholder')"
            />
          </div>
          <button class="btn btn-success btn-sm" @click="openCreateModal">
            <i class="fa fa-plus me-1"></i>
            {{ $t('labelsPage.addButton') }}
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="card-body p-0">

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

        <div v-else class="table-responsive">
          <table class="table table-hover mb-0 label-table">
            <thead>
              <tr>
                <th>{{ $t('labelsPage.table.name') }}</th>
                <th>{{ $t('labelsPage.table.color') }}</th>
                <th class="text-end">{{ $t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="label in filteredLabels" :key="label.id">
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <span class="label-dot" :style="{ background: label.colorCode }"></span>
                    <span class="label-chip"
                      :style="{
                        background: label.colorCode + '1a',
                        color: label.colorCode,
                        borderColor: label.colorCode + '55'
                      }"
                    >{{ label.name }}</span>
                  </div>
                </td>
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <span class="color-swatch" :style="{ background: label.colorCode }"></span>
                    <code class="color-code">{{ label.colorCode }}</code>
                  </div>
                </td>
                <td class="text-end">
                  <button
                    class="btn btn-sm btn-outline-warning me-1"
                    v-tooltip="$t('common.tooltips.edit')"
                    @click="openEditModal(label)"
                  >
                    <i class="fa fa-pencil"></i>
                  </button>
                  <button
                    class="btn btn-sm btn-outline-danger"
                    v-tooltip="$t('common.tooltips.delete')"
                    @click="deleteLabel(label)"
                  >
                    <i class="fa fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
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
/* ── Search ──────────────────────────────────────────────────────── */
.search-wrap {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 9px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #9ca3af;
  pointer-events: none;
}

.search-input {
  padding-left: 28px;
  min-width: 200px;
}

/* ── Table ───────────────────────────────────────────────────────── */
.label-table th {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b7280;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  padding: 10px 16px;
}

.label-table td {
  padding: 12px 16px;
  vertical-align: middle;
  border-bottom: 1px solid #f3f4f6;
}

.label-table tbody tr:last-child td {
  border-bottom: none;
}

.label-table tbody tr:hover td {
  background: #f9fafb;
}

.label-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  display: inline-block;
}

.label-chip {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border-radius: 20px;
  border: 1px solid;
  font-size: 13px;
  font-weight: 600;
}

.color-swatch {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 1px solid rgba(0,0,0,0.08);
  display: inline-block;
  flex-shrink: 0;
}

.color-code {
  font-size: 12px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
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
