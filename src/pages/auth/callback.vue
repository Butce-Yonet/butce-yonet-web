<template>
</template>

<script>
import authService from '@/services/auth.service';
export default {
    mounted() {
        authService.login();
        authService.getCurrentUser().then(user => {
            this.$store.dispatch('user/setCurrentUser', user);
            this.$router.push({ path: '/' });
        }).catch(error => {
            console.error('Error fetching current user:', error);
            this.$router.push({ path: '/auth/failed' });
        });
    }
}
</script>