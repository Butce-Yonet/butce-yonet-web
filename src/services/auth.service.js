import {
    authServerUrl,
    authServerRedirectUrl
} from '@/constants/config';

class AuthService {

    isAuthenticated() {
        var auth_token = window.localStorage.getItem('auth_token');
        return auth_token != null;
    }

    redirectToLogin() {
        window.location.href = authServerUrl + '/connect/authorize?redirect_uri=' + encodeURIComponent(authServerRedirectUrl);
    }

    login() {
        var urlParams = new URLSearchParams(window.location.search);
        var accessToken = urlParams.get('access_token');
        var refreshToken = urlParams.get('refresh_token');
        var expireAccessToken = urlParams.get('expire_access_token');
        var expireRefreshToken = urlParams.get('expire_refresh_token');

        window.localStorage.setItem('auth_token', accessToken);
        window.localStorage.setItem('refresh_token', refreshToken);
        window.localStorage.setItem('expire_access_token', expireAccessToken);
        window.localStorage.setItem('expire_refresh_token', expireRefreshToken);
    }

    getToken() {
        return window.localStorage.getItem('auth_token');
    }

    getRefreshToken() {
        return window.localStorage.getItem('refresh_token');
    }

    async refreshToken() {
        try {
            const refreshToken = this.getRefreshToken();
            if (!refreshToken) return false;

            const response = await fetch(`${authServerUrl}/connect/refresh_token?refreshToken=${encodeURIComponent(refreshToken)}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                this.logout();
                return false;
            }

            const data = await response.json();
            if (data.accessToken) {
                window.localStorage.setItem('auth_token', data.accessToken);
            }
            if (data.expireAccessToken) {
                window.localStorage.setItem('expire_access_token', data.expireAccessToken);
            }

            return true;
        } catch (e) {
            console.error("Refresh token request error:", e);
            return false;
        }
    }

    async getCurrentUser() {
        try {
            const token = this.getToken();
            if (!token) return false;

            const response = await fetch(`${authServerUrl}/app/userinfo`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Accept': 'application/json'
                }
            });

            if (response.status === 401 || response.status === 403) {
                this.logout();
                return false;
            }

            return await response.json();
        } catch (e) {
            console.error("Refresh token error:", e);
            return false;
        }
    }

    async _fetchWithAuth(url, options = {}) {
        const token = this.getToken();
        if (!token) return null;

        const makeRequest = (t) => fetch(url, {
            ...options,
            headers: { ...options.headers, 'Authorization': 'Bearer ' + t },
        });

        let response = await makeRequest(token);

        if (response.status === 401) {
            const refreshed = await this.refreshToken();
            if (!refreshed) return null;
            response = await makeRequest(this.getToken());
        }

        return response;
    }

    async checkConsent(type, language) {
        try {
            const response = await this._fetchWithAuth(
                `${authServerUrl}/api/consents/check?type=${type}&language=${language}`,
                { headers: { 'Accept': 'application/json' } }
            );
            if (!response?.ok) return null;
            return await response.json();
        } catch {
            return null;
        }
    }

    async acceptConsent(type, language) {
        try {
            const response = await this._fetchWithAuth(
                `${authServerUrl}/api/consents/accept`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({ Type: type, Language: language }),
                }
            );
            return response?.ok ?? false;
        } catch {
            return false;
        }
    }

    logout() {
        try {
            window.localStorage.removeItem('auth_token');
            window.localStorage.removeItem('refresh_token');
            window.localStorage.removeItem('expire_access_token');
            window.localStorage.removeItem('expire_refresh_token');
            window.localStorage.removeItem('user_data');
        } catch (e) {
            console.error("Error during logout:", e);
        }
        finally {
            window.location.reload();
        }
    }
}

export default new AuthService();