<template>
  <div class="error-page">
    <div class="error-card">
      <brand-logo class="error-brand" />
      <div class="error-code">{{ code }}</div>
      <h1>{{ title }}</h1>
      <p>{{ text }}</p>
      <div class="error-actions">
        <slot>
          <router-link to="/" class="btn btn-primary btn-lg">
            <vue-feather type="home" size="16"></vue-feather>
            {{ $t('errorPage.backHome') }}
          </router-link>
        </slot>
      </div>
    </div>
  </div>
</template>

<script>
import BrandLogo from '@/components/layout/BrandLogo.vue';

export default {
  name: 'ErrorView',
  components: { BrandLogo },
  props: {
    code: { type: String, required: true },
    title: { type: String, required: true },
    text: { type: String, default: '' },
  },
};
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background:
    radial-gradient(800px 400px at 50% -10%, var(--primary-soft), transparent),
    var(--bg);
}

.error-card {
  max-width: 440px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.error-brand {
  margin-bottom: 24px;
}

.error-code {
  font-size: 72px;
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1;
  background: linear-gradient(135deg, var(--brand-500), var(--brand-700));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

h1 {
  font-size: 20px;
  font-weight: 700;
}

p {
  color: var(--text-2);
  font-size: 14.5px;
}

.error-actions {
  margin-top: 16px;
  display: flex;
  gap: 8px;
}
</style>
