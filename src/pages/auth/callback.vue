<template>
</template>

<script>
import authService from '@/services/auth.service';
export default {
    mounted() {
        authService.login();
        setTimeout(() => {
            this.$router.push({ path: '/' });
        }, 500);
    }
}
</script>