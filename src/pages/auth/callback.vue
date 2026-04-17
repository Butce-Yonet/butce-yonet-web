<template>
</template>

<script>
import authService from '@/services/auth.service';
import { localeOptions } from '@/constants/config';

export default {
    mounted() {
        authService.login();
        authService.getCurrentUser().then(user => {
            this.$store.dispatch('user/setCurrentUser', user);
            this.applyLanguageFromUrl();
            this.$router.push({ path: '/' });
        }).catch(error => {
            console.error('Error fetching current user:', error);
            this.$router.push({ path: '/auth/failed' });
        });
    },
    methods: {
        applyLanguageFromUrl() {
            const params = new URLSearchParams(window.location.search);
            const langParam = params.get('language');
            if (!langParam) return;

            const matched = localeOptions.find(
                l => l.id.toLowerCase() === langParam.toLowerCase()
            );
            if (!matched) return;

            this.$i18n.locale = matched.id;
            this.$store.dispatch('setLang', matched);
        }
    }
}
</script>