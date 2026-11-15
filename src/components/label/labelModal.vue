<template>
  <app-modal
    :open="open"
    :title="mode === 'edit' ? $t('labelsPage.modal.editSubtitle') : $t('labelsPage.modal.createSubtitle')"
    icon="tag"
    tone="neutral"
    size="sm"
    @close="$emit('close')"
  >
    <form id="labelForm" class="label-form" novalidate @submit.prevent="save">
      <div class="label-preview">
        <span class="chip lg" :style="{ background: soft(form.colorCode), color: form.colorCode }">
          <i class="dot"></i>
          <span>{{ form.name || $t('labelsPage.form.namePlaceholder') }}</span>
        </span>
      </div>

      <div class="field">
        <label class="field-label" for="label-name">{{ $t('labelsPage.form.namePlaceholder') }}</label>
        <input
          id="label-name"
          v-model="form.name"
          class="input"
          :class="{ 'is-invalid': showError('name') }"
          :placeholder="$t('labelExtra.namePlaceholder')"
          maxlength="60"
          autocomplete="off"
          autofocus
        />
        <span v-if="showError('name')" class="field-error">{{ errors.name }}</span>
      </div>

      <div class="field">
        <label class="field-label">{{ $t('labelsPage.form.colorPlaceholder') }}</label>
        <div class="swatches" role="radiogroup">
          <button
            v-for="c in palette"
            :key="c"
            type="button"
            class="swatch"
            role="radio"
            :aria-checked="sameColor(c)"
            :aria-label="c"
            :class="{ active: sameColor(c) }"
            :style="{ background: c }"
            @click="form.colorCode = c"
          >
            <vue-feather v-if="sameColor(c)" type="check" size="14"></vue-feather>
          </button>
          <label class="swatch custom" :class="{ active: isCustom }" :style="isCustom ? { background: form.colorCode } : null" :aria-label="$t('labelExtra.customColor')">
            <vue-feather type="edit-3" size="13"></vue-feather>
            <input v-model="form.colorCode" type="color" />
          </label>
        </div>
      </div>
    </form>

    <template #footer>
      <button v-if="mode === 'edit'" type="button" class="btn btn-danger-ghost" :disabled="submitting" @click="remove">
        <vue-feather type="trash-2" size="15"></vue-feather>
        <span class="hide-mobile">{{ $t('common.delete') }}</span>
      </button>
      <span class="spacer"></span>
      <button type="button" class="btn btn-secondary" @click="$emit('close')">{{ $t('common.cancel') }}</button>
      <button type="submit" form="labelForm" class="btn btn-primary" :disabled="submitting">
        <span v-if="submitting" class="spinner sm"></span>
        <vue-feather v-else type="check" size="16"></vue-feather>
        {{ $t('common.save') }}
      </button>
    </template>
  </app-modal>
</template>

<script>
import * as yup from 'yup';
import AppModal from '@/components/ui/AppModal.vue';
import userLabelService from '@/services/user.label.service';
import { createYupValidator } from '@/services/validator.service';
import { softColor } from '@/utils/format';
import { confirmDelete } from '@/utils/confirm';

const PALETTE = [
  '#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
  '#d946ef', '#ec4899', '#f43f5e', '#ef4444', '#f97316', '#f59e0b',
  '#eab308', '#84cc16', '#64748b', '#78716c',
];

export default {
  name: 'LabelModal',
  components: { AppModal },
  props: {
    open: { type: Boolean, default: false },
    mode: { type: String, default: 'create' },
    data: { type: Object, default: null },
  },
  emits: ['close', 'saved'],
  data() {
    return {
      form: { id: null, name: '', colorCode: PALETTE[0] },
      palette: PALETTE,
      errors: {},
      submitted: false,
      submitting: false,
      validator: null,
    };
  },
  computed: {
    isCustom() {
      return !this.palette.some((c) => this.sameColor(c));
    },
  },
  watch: {
    open(val) {
      if (!val) return;
      this.submitted = false;
      this.errors = {};
      if (this.mode === 'edit' && this.data) {
        this.form = { id: this.data.id, name: this.data.name, colorCode: this.data.colorCode || PALETTE[0] };
      } else {
        const used = new Set(this.$store.getters['dashboard/getLabels'].map((l) => (l.colorCode || '').toLowerCase()));
        const next = PALETTE.find((c) => !used.has(c)) || PALETTE[0];
        this.form = { id: null, name: '', colorCode: next };
      }
    },
    form: {
      deep: true,
      handler() {
        if (this.submitted) this.validator.validateForm(this.form, this.errors);
      },
    },
  },
  created() {
    const schema = yup.object({
      name: yup.string().trim().required(this.$t('validation.message.required')),
    });
    this.validator = createYupValidator(schema);
  },
  methods: {
    soft(c) {
      return softColor(c, '1f');
    },
    sameColor(c) {
      return (this.form.colorCode || '').toLowerCase() === c.toLowerCase();
    },
    showError(field) {
      return this.submitted && !!this.errors[field];
    },
    async save() {
      this.submitted = true;
      const ok = await this.validator.validateForm(this.form, this.errors);
      if (!ok) return;

      this.submitting = true;
      const isCreate = this.mode !== 'edit';
      try {
        const response = isCreate
          ? await userLabelService.createUserLabel({ name: this.form.name.trim(), colorCode: this.form.colorCode })
          : await userLabelService.updateUserLabel({ id: this.form.id, name: this.form.name.trim(), colorCode: this.form.colorCode });
        if (response.status !== 200) throw new Error('save failed');
        this.$toast.success(this.$t(`labelsPage.messages.${isCreate ? 'createSuccess' : 'editSuccess'}`));
        this.$emit('saved');
      } catch {
        this.$toast.error(this.$t(`labelsPage.messages.${isCreate ? 'createError' : 'editError'}`));
      } finally {
        this.submitting = false;
      }
    },
    async remove() {
      const ok = await confirmDelete(this.$t('labelsPage.messages.areYouSureDelete'));
      if (!ok) return;
      this.submitting = true;
      try {
        const response = await userLabelService.deleteUserLabel(this.form.id);
        if (response.status !== 200) throw new Error('delete failed');
        this.$toast.success(this.$t('labelsPage.messages.deleteSuccess'));
        this.$emit('saved');
      } catch {
        this.$toast.error(this.$t('labelsPage.messages.deleteError'));
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>

<style scoped>
.label-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.label-preview {
  display: flex;
  justify-content: center;
  padding: 20px;
  border-radius: var(--radius);
  background: var(--surface-2);
  border: 1px dashed var(--border-strong);
}

.chip.lg {
  height: 30px;
  padding: 0 14px;
  font-size: 14px;
  max-width: 100%;
}

.chip.lg .dot {
  width: 8px;
  height: 8px;
}

.swatches {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(32px, 1fr));
  gap: 8px;
}

.swatch {
  position: relative;
  aspect-ratio: 1;
  border-radius: 10px;
  border: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
  transition: transform 0.12s, box-shadow 0.12s;
}

.swatch:hover {
  transform: scale(1.08);
}

.swatch.active {
  box-shadow: 0 0 0 2px var(--surface), 0 0 0 4px var(--text);
}

.swatch.custom {
  background: conic-gradient(#ef4444, #f59e0b, #84cc16, #10b981, #06b6d4, #6366f1, #d946ef, #ef4444);
  overflow: hidden;
}

.swatch.custom input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}
</style>
