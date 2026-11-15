<template>
  <div class="card">
    <div class="card-head">
      <div>
        <div class="card-title">{{ $t('profile.password.title') }}</div>
        <div class="card-subtitle">{{ $t('profile.password.subtitle') }}</div>
      </div>
    </div>

    <form class="card-body pw-form" novalidate @submit.prevent="submit">
      <div v-if="externalAccount" class="pw-alert">
        <vue-feather type="info" size="16"></vue-feather>
        {{ $t('profile.password.externalAccount') }}
      </div>

      <div class="field">
        <label class="field-label" for="pw-current">{{ $t('profile.password.current') }}</label>
        <div class="input-wrap pw-wrap">
          <input
            id="pw-current"
            v-model="form.current"
            :type="show.current ? 'text' : 'password'"
            class="input"
            :class="{ 'is-invalid': showError('current') }"
            autocomplete="current-password"
          />
          <button type="button" class="pw-eye" :aria-label="$t('profile.password.toggleVisibility')" @click="show.current = !show.current">
            <vue-feather :type="show.current ? 'eye-off' : 'eye'" size="16"></vue-feather>
          </button>
        </div>
        <span v-if="showError('current')" class="field-error">{{ errors.current }}</span>
      </div>

      <div class="field">
        <label class="field-label" for="pw-new">{{ $t('profile.password.new') }}</label>
        <div class="input-wrap pw-wrap">
          <input
            id="pw-new"
            v-model="form.next"
            :type="show.next ? 'text' : 'password'"
            class="input"
            :class="{ 'is-invalid': showError('next') }"
            autocomplete="new-password"
          />
          <button type="button" class="pw-eye" :aria-label="$t('profile.password.toggleVisibility')" @click="show.next = !show.next">
            <vue-feather :type="show.next ? 'eye-off' : 'eye'" size="16"></vue-feather>
          </button>
        </div>
        <ul class="pw-rules">
          <li v-for="r in rules" :key="r.key" :class="{ ok: r.ok }">
            <vue-feather :type="r.ok ? 'check-circle' : 'circle'" size="13"></vue-feather>
            {{ r.text }}
          </li>
        </ul>
        <span v-if="showError('next')" class="field-error">{{ errors.next }}</span>
      </div>

      <div class="field">
        <label class="field-label" for="pw-confirm">{{ $t('profile.password.confirm') }}</label>
        <div class="input-wrap pw-wrap">
          <input
            id="pw-confirm"
            v-model="form.confirm"
            :type="show.next ? 'text' : 'password'"
            class="input"
            :class="{ 'is-invalid': showError('confirm') }"
            autocomplete="new-password"
          />
        </div>
        <span v-if="showError('confirm')" class="field-error">{{ errors.confirm }}</span>
      </div>

      <div class="pw-actions">
        <button type="submit" class="btn btn-primary" :disabled="submitting || externalAccount">
          <span v-if="submitting" class="spinner sm"></span>
          <vue-feather v-else type="lock" size="15"></vue-feather>
          {{ $t('profile.password.submit') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import authService from '@/services/auth.service';

const MIN_LENGTH = 8;

export default {
  name: 'ProfilePassword',
  data() {
    return {
      form: { current: '', next: '', confirm: '' },
      show: { current: false, next: false },
      errors: {},
      submitted: false,
      submitting: false,
      externalAccount: false,
    };
  },
  computed: {
    rules() {
      const p = this.form.next;
      return [
        { key: 'len', ok: p.length >= MIN_LENGTH, text: this.$t('profile.password.rules.length', { n: MIN_LENGTH }) },
        { key: 'letter', ok: /[A-Za-zÇĞİÖŞÜçğıöşü]/.test(p) && /\d/.test(p), text: this.$t('profile.password.rules.letterDigit') },
        { key: 'diff', ok: !!p && p !== this.form.current, text: this.$t('profile.password.rules.different') },
      ];
    },
  },
  watch: {
    form: {
      deep: true,
      handler() {
        if (this.submitted) this.validate();
      },
    },
  },
  methods: {
    showError(field) {
      return this.submitted && !!this.errors[field];
    },
    validate() {
      const e = {};
      const req = this.$t('validation.message.required');
      if (!this.form.current) e.current = req;
      if (!this.form.next) e.next = req;
      else if (this.rules.some((r) => !r.ok)) e.next = this.$t('profile.password.errors.weak');
      if (!this.form.confirm) e.confirm = req;
      else if (this.form.confirm !== this.form.next) e.confirm = this.$t('profile.password.errors.mismatch');
      this.errors = e;
      return Object.keys(e).length === 0;
    },
    async submit() {
      this.submitted = true;
      if (!this.validate()) return;

      this.submitting = true;
      const res = await authService.changePassword(this.form.current, this.form.next);
      this.submitting = false;

      if (res.ok) {
        this.$toast.success(this.$t('profile.password.success'));
        this.form = { current: '', next: '', confirm: '' };
        this.submitted = false;
        this.errors = {};
        return;
      }

      // Map known server messages to fields / localized text.
      const message = (res.messages || []).join(' ').toLowerCase();
      if (message.includes('incorrect')) {
        this.errors = { ...this.errors, current: this.$t('profile.password.errors.incorrect') };
      } else if (message.includes('external')) {
        this.externalAccount = true;
      } else {
        this.$toast.error(this.$t('profile.password.errors.generic'));
      }
    },
  },
};
</script>

<style scoped>
.pw-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-width: 480px;
}

.pw-wrap .input {
  padding-left: 12px;
  padding-right: 42px;
}

.pw-eye {
  position: absolute;
  right: 4px;
  width: 34px;
  height: 32px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--text-3);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.pw-eye:hover {
  color: var(--text);
  background: var(--surface-3);
}

.pw-rules {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 2px;
}

.pw-rules li {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: var(--text-3);
}

.pw-rules li.ok {
  color: var(--income);
}

.pw-alert {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  background: var(--warning-soft);
  color: var(--warning);
  font-size: 13px;
  font-weight: 500;
}

.pw-alert .vue-feather {
  margin-top: 1px;
}

.pw-actions {
  display: flex;
}

@media (max-width: 600px) {
  .pw-form {
    max-width: none;
  }

  .pw-actions .btn {
    width: 100%;
  }
}
</style>
