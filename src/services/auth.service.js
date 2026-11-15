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

    // Persists the user's last selected UI language on the auth server.
    async setActiveLanguage(language) {
        try {
            const response = await this._fetchWithAuth(
                `${authServerUrl}/app/active-language`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({ Language: language }),
                }
            );
            const ok = response?.ok ?? false;
            if (ok) this._markLanguageSynced(language);
            return ok;
        } catch {
            return false;
        }
    }

    // Calls an authenticated auth-server JSON endpoint.
    // Resolves to { ok, status, data, messages } and never throws.
    async _authJson(path, method = 'GET', body) {
        try {
            const response = await this._fetchWithAuth(`${authServerUrl}${path}`, {
                method,
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: body === undefined ? undefined : JSON.stringify(body),
            });
            if (!response) return { ok: false, status: 0, data: null, messages: [] };
            let json = null;
            try {
                json = await response.json();
            } catch {
                // empty or non-JSON body
            }
            return {
                ok: response.ok,
                status: response.status,
                data: json?.data ?? json?.Data ?? null,
                messages: json?.messages ?? json?.Messages ?? [],
            };
        } catch {
            return { ok: false, status: 0, data: null, messages: [] };
        }
    }

    changePassword(currentPassword, newPassword) {
        return this._authJson('/app/change-password', 'POST', {
            CurrentPassword: currentPassword,
            NewPassword: newPassword,
        });
    }

    getNotificationSettings() {
        return this._authJson('/app/notification-settings', 'GET');
    }

    // settings: [{ name, isEnabled }]
    updateNotificationSettings(settings) {
        return this._authJson('/app/notification-settings', 'PUT', {
            Settings: settings.map((s) => ({ Name: s.name, IsEnabled: s.isEnabled })),
        });
    }

    // FCM device tokens (DotBoil.FCM module on the auth server).
    // platform: DevicePlatform enum — 1: Android, 2: iOS, 3: Web
    registerFcmToken(token, deviceId, platform = 3) {
        return this._authJson('/api/fcm/tokens', 'POST', {
            Token: token,
            Platform: platform,
            DeviceId: deviceId,
        });
    }

    unregisterFcmToken(token) {
        return this._authJson('/api/fcm/tokens/unregister', 'POST', { Token: token });
    }

    // Sends the current language once per user/device so existing users whose
    // ActiveLanguage is still NULL get their real selection stored.
    async syncActiveLanguageOnce(language) {
        if (!language || this._syncedLanguage() === language) return true;
        return this.setActiveLanguage(language);
    }

    _languageSyncKey() {
        try {
            const user = JSON.parse(window.localStorage.getItem('current_user') || '{}');
            const id = user.sub || user.preferred_username || user.email || 'anonymous';
            return `active_language_synced:${id}`;
        } catch {
            return 'active_language_synced:anonymous';
        }
    }

    _syncedLanguage() {
        try {
            return window.localStorage.getItem(this._languageSyncKey());
        } catch {
            return null;
        }
    }

    _markLanguageSynced(language) {
        try {
            window.localStorage.setItem(this._languageSyncKey(), language);
        } catch {
            // storage unavailable — we'll simply sync again next time
        }
    }

    async logout() {
        try {
            // Unregister the push token while the auth token is still valid.
            // Dynamic import avoids a circular dependency (firebase.service imports this file).
            const { unregisterPushToken } = await import('@/services/firebase.service');
            await unregisterPushToken();
        } catch (e) {
            console.error("Error unregistering push token:", e);
        }
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