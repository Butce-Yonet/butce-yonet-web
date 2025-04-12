<template>
    <div></div>
</template>

<script>
import authClient from '@/services/authClient'

export default {
    created() {
        const urlParams = new URLSearchParams(window.location.search);
        var accessToken = urlParams.get('access_token');
        var refreshtoken = urlParams.get('refresh_token');

        if (!accessToken || !refreshtoken) {
            authClient.redirectToLoginPage();
        } else {
            window.localStorage.setItem('access_token', accessToken);
            window.localStorage.setItem('refresh_token', refreshtoken);

            authClient.getUserInfo().finally(() => {
                window.location.reload();
            });
        }
    }
}

</script>