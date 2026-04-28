<template>
  <li class="notebook-nav" ref="selector" id="headerNotebookSelector">
    <div class="notebook-trigger" @click="toggleDropdown" :class="{ active: isOpen }">
      <div class="nb-icon">
        <i class="fa fa-book"></i>
      </div>
      <div class="nb-body">
        <span class="nb-label d-none d-xl-block">{{ $t('header.activeNotebook') }}</span>
        <span class="nb-name">{{ selectedNotebook ? selectedNotebook.name : '...' }}</span>
      </div>
      <i class="fa fa-angle-down nb-caret" :class="{ rotated: isOpen }"></i>
    </div>

    <div class="notebook-dropdown" v-if="isOpen">
      <div class="notebook-dropdown-list">
        <div
          v-for="notebook in notebooks"
          :key="notebook.id"
          class="nb-item"
          :class="{ 'is-selected': selectedNotebook && notebook.id === selectedNotebook.id }"
          @click="selectNotebook(notebook)"
        >
          <div class="nb-item-left">
            <i class="fa me-2"
               :class="selectedNotebook && notebook.id === selectedNotebook.id
                 ? 'fa-check-circle text-success'
                 : 'fa-book text-muted'">
            </i>
            <span class="nb-item-name">{{ notebook.name }}</span>
            <span v-if="notebook.isDefault" class="nb-default-badge">{{ $t('common.defaultLabel') }}</span>
          </div>
          <div class="nb-item-actions" @click.stop>
            <button class="nb-btn nb-btn-edit"
                    v-tooltip="$t('common.tooltips.editNotebook')"
                    @click="editNotebook(notebook)">
              <i class="fa fa-pencil"></i>
            </button>
            <button class="nb-btn nb-btn-detail"
                    v-tooltip="$t('common.tooltips.editNotebookDetail')"
                    @click="editNotebookDetail(notebook)">
              <i class="fa fa-cogs"></i>
            </button>
            <button class="nb-btn nb-btn-delete"
                    :disabled="notebook.isDefault"
                    v-tooltip="$t('common.tooltips.deleteNotebook')"
                    @click="deleteNotebook(notebook)">
              <i class="fa fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
      <div class="nb-footer">
        <button class="nb-create-btn" @click="createNotebook">
          <i class="fa fa-plus me-1"></i>{{ $t('header.createNotebook') }}
        </button>
      </div>
    </div>
  </li>
</template>

<script>
import { mapState } from 'vuex';
import notebookService from '@/services/notebook.service';

export default {
  name: 'NotebookSelector',
  data() {
    return { isOpen: false };
  },
  computed: {
    ...mapState({
      selectedNotebook: state => state.notebook.selectedNotebook,
      notebooks: state => state.notebook.notebooks,
    }),
  },
  mounted() {
    document.addEventListener('click', this.handleOutsideClick);
  },
  unmounted() {
    document.removeEventListener('click', this.handleOutsideClick);
  },
  methods: {
    toggleDropdown() {
      this.isOpen = !this.isOpen;
    },
    handleOutsideClick(e) {
      if (this.$refs.selector && !this.$refs.selector.contains(e.target)) {
        this.isOpen = false;
      }
    },
    selectNotebook(notebook) {
      localStorage.setItem('selectedNotebookId', notebook.id);
      this.$store.dispatch('notebook/setSelectedNotebook', notebook);
      this.isOpen = false;
    },
    createNotebook() {
      this.$store.dispatch('notebook/showCreateNotebookModal');
      this.$store.dispatch('notebook/setModalMode', 'create');
      this.$store.dispatch('notebook/setModalNotebook', {});
      this.isOpen = false;
    },
    editNotebook(notebook) {
      this.$store.dispatch('notebook/showCreateNotebookModal');
      this.$store.dispatch('notebook/setModalMode', 'edit');
      this.$store.dispatch('notebook/setModalNotebook', notebook);
      this.isOpen = false;
    },
    editNotebookDetail(notebook) {
      this.$store.dispatch('notebook/showEditNotebookDetailModal');
      this.$store.dispatch('notebook/setModalNotebook', notebook);
      this.isOpen = false;
    },
    deleteNotebook(notebook) {
      this.isOpen = false;
      this.$swal({
        title: this.$t('createNotebookModal.messages.areYouSureDelete'),
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: this.$t('common.yes'),
        denyButtonText: this.$t('common.no'),
      }).then((result) => {
        if (result.isConfirmed) {
          notebookService.deleteNotebook(notebook.id)
            .then((response) => {
              if (response.status === 200) {
                this.$swal({ title: this.$t('createNotebookModal.messages.deleteSuccess'), icon: 'success' });
                notebookService.loadNotebooks();
              } else {
                this.$swal({ title: this.$t('createNotebookModal.messages.deleteError'), icon: 'error' });
              }
            })
            .catch(() => {
              this.$swal({ title: this.$t('createNotebookModal.messages.deleteError'), icon: 'error' });
            });
        }
      });
    },
  },
};
</script>

<style scoped>
.notebook-nav {
  position: relative;
  list-style: none;
  align-items: center;
}

/* Trigger */
.notebook-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px 6px 8px;
  border-radius: 10px;
  border: 1.5px solid #e5e7eb;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
  max-width: 200px;
}

.notebook-trigger:hover,
.notebook-trigger.active {
  border-color: #10b981;
  background: #f0fdf4;
}

.nb-icon {
  width: 26px;
  height: 26px;
  border-radius: 7px;
  background: linear-gradient(135deg, #10b981, #059669);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 11px;
  flex-shrink: 0;
}

.nb-body {
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.nb-label {
  font-size: 10px;
  font-weight: 600;
  color: #059669;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  line-height: 1.2;
}

.nb-name {
  font-size: 13px;
  font-weight: 700;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

.nb-caret {
  font-size: 12px;
  color: #9ca3af;
  flex-shrink: 0;
  transition: transform 0.2s;
}

.nb-caret.rotated {
  transform: rotate(180deg);
}

/* Dropdown */
.notebook-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  min-width: 280px;
  max-width: 360px;
  background: #fff;
  border: 1.5px solid #d1fae5;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 9999;
  overflow: hidden;
}

.notebook-dropdown-list {
  max-height: 260px;
  overflow-y: auto;
  padding: 6px;
}

.nb-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}

.nb-item:hover { background: #f0fdf4; }
.nb-item.is-selected { background: #dcfce7; }

.nb-item-left {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.nb-item-name {
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nb-default-badge {
  display: inline-block;
  margin-left: 6px;
  padding: 1px 6px;
  font-size: 10px;
  font-weight: 600;
  color: #059669;
  background: #d1fae5;
  border-radius: 4px;
  white-space: nowrap;
  flex-shrink: 0;
}

.nb-item-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.nb-btn {
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  background: transparent;
}
.nb-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.nb-btn-edit  { color: #d97706; }
.nb-btn-edit:hover:not(:disabled)   { background: #fef3c7; color: #92400e; }
.nb-btn-detail { color: #2563eb; }
.nb-btn-detail:hover:not(:disabled) { background: #dbeafe; color: #1e40af; }
.nb-btn-delete { color: #dc2626; }
.nb-btn-delete:hover:not(:disabled) { background: #fee2e2; color: #991b1b; }

.nb-footer {
  padding: 6px;
  border-top: 1px solid #f0fdf4;
}

.nb-create-btn {
  width: 100%;
  padding: 8px 12px;
  border: 1.5px dashed #6ee7b7;
  border-radius: 8px;
  background: transparent;
  color: #059669;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  text-align: left;
}
.nb-create-btn:hover {
  background: #f0fdf4;
  border-color: #10b981;
}
</style>
