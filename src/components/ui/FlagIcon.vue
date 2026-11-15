<template>
  <span class="flag" :style="{ width: size + 'px', height: Math.round(size * 2 / 3) + 'px' }" aria-hidden="true">
    <!-- Türkiye -->
    <svg v-if="code === 'tr'" viewBox="0 0 30 20" preserveAspectRatio="none">
      <rect width="30" height="20" fill="#E30A17" />
      <circle cx="10.5" cy="10" r="5" fill="#fff" />
      <circle cx="11.75" cy="10" r="4" fill="#E30A17" />
      <polygon
        fill="#fff"
        points="13.4,10 14.91,9.5 14.92,7.91 15.86,9.19 17.38,8.71 16.45,10 17.38,11.29 15.86,10.81 14.92,12.09 14.91,10.5"
      />
    </svg>

    <!-- English (US) -->
    <svg v-else viewBox="0 0 30 20" preserveAspectRatio="none">
      <rect width="30" height="20" fill="#fff" />
      <rect v-for="i in 7" :key="i" :y="(i - 1) * 3.077" width="30" height="1.538" fill="#B22234" />
      <rect width="13" height="10.77" fill="#3C3B6E" />
      <g fill="#fff">
        <circle v-for="(s, i) in stars" :key="i" :cx="s[0]" :cy="s[1]" r="0.45" />
      </g>
    </svg>
  </span>
</template>

<script>
const stars = [];
for (let row = 0; row < 4; row++) {
  for (let col = 0; col < 5; col++) {
    stars.push([1.6 + col * 2.45 + (row % 2) * 1.2, 1.5 + row * 2.6]);
  }
}

export default {
  name: 'FlagIcon',
  props: {
    code: { type: String, required: true },
    size: { type: Number, default: 20 },
  },
  data() {
    return { stars };
  },
};
</script>

<style scoped>
.flag {
  display: inline-flex;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 3px;
  box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.12);
}

.flag svg {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
