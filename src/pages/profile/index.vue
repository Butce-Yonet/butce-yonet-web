<template>
  <div class="page profile-page">
    <div class="page-head">
      <div class="segmented profile-tabs" role="tablist">
        <button
          v-for="t in tabs"
          :key="t.key"
          type="button"
          role="tab"
          :aria-selected="tab === t.key"
          :class="{ active: tab === t.key }"
          @click="setTab(t.key)"
        >
          <vue-feather :type="t.icon" size="15" class="hide-mobile"></vue-feather>
          <span class="hide-mobile">{{ $t(t.label) }}</span>
          <span class="show-mobile">{{ $t(t.short) }}</span>
        </button>
      </div>
    </div>

    <profile-general v-if="tab === 'general'" />
    <profile-password v-else-if="tab === 'password'" />
    <profile-notifications v-else />
  </div>
</template>

<script>
import ProfileGeneral from '@/components/profile/ProfileGeneral.vue';
import ProfilePassword from '@/components/profile/ProfilePassword.vue';
import ProfileNotifications from '@/components/profile/ProfileNotifications.vue';

const TABS = [
  { key: 'general', label: 'profile.tabs.general', short: 'profile.tabs.short.general', icon: 'user' },
  { key: 'password', label: 'profile.tabs.password', short: 'profile.tabs.short.password', icon: 'lock' },
  { key: 'notifications', label: 'profile.tabs.notifications', short: 'profile.tabs.short.notifications', icon: 'bell' },
];

export default {
  name: 'ProfilePage',
  components: { ProfileGeneral, ProfilePassword, ProfileNotifications },
  data() {
    return { tabs: TABS };
  },
  computed: {
    // The active tab lives in the URL (?tab=...) so it survives refresh and can be linked.
    tab() {
      const t = this.$route.query.tab;
      return TABS.some((x) => x.key === t) ? t : 'general';
    },
  },
  methods: {
    setTab(key) {
      this.$router.replace({ query: key === 'general' ? {} : { tab: key } });
    },
  },
};
</script>

<style scoped>
/* Keep the page left-aligned like the others, but limit the reading width. */
.profile-page > :deep(*) {
  max-width: 820px;
}

@media (max-width: 767px) {
  .profile-tabs {
    display: flex;
    width: 100%;
  }

  .profile-tabs button {
    flex: 1;
    justify-content: center;
  }
}
</style>
