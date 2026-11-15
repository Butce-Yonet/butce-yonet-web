<template>
  <router-link to="/" class="brand" :aria-label="'Bütçe Yönet'">
    <span class="brand-mark">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="13" width="4" height="8" rx="1.2" fill="currentColor" opacity="0.55" />
        <rect x="10" y="9" width="4" height="12" rx="1.2" fill="currentColor" opacity="0.8" />
        <rect x="17" y="4" width="4" height="17" rx="1.2" fill="currentColor" />
      </svg>
    </span>
    <span v-if="!compact" class="brand-text">Bütçe<span>Yönet</span></span>
  </router-link>
</template>

<script>
export default {
  name: 'BrandLogo',
  props: {
    compact: { type: Boolean, default: false },
  },
};
</script>

<style scoped>
.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--text);
  text-decoration: none;
}

.brand:hover {
  color: var(--text);
}

.brand-mark {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #10b981, #047857);
  color: #fff;
  box-shadow: 0 4px 12px -2px rgba(5, 150, 105, 0.45);
  flex-shrink: 0;
}

.brand-text {
  font-size: 17px;
  font-weight: 750;
  letter-spacing: -0.03em;
}

.brand-text span {
  color: var(--primary);
}
</style>
