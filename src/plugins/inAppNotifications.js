import { reactive } from 'vue';

// Push messages received while the app is open. Unlike toasts they stay until the user closes
// or opens them, so they can't slip by unnoticed.
const MAX_ITEMS = 3;

let seq = 0;

export const inAppNotificationState = reactive({ items: [] });

// notification: { title, body, link }
export function pushInAppNotification({ title, body, link } = {}) {
    if (!title && !body) return null;
    const id = ++seq;
    inAppNotificationState.items.unshift({ id, title, body, link: link || null, receivedAt: Date.now() });
    if (inAppNotificationState.items.length > MAX_ITEMS) inAppNotificationState.items.pop();
    return id;
}

export function dismissInAppNotification(id) {
    const idx = inAppNotificationState.items.findIndex((n) => n.id === id);
    if (idx > -1) inAppNotificationState.items.splice(idx, 1);
}

export function clearInAppNotifications() {
    inAppNotificationState.items.splice(0);
}

// Normalises an FCM payload: "notification" messages and data-only messages carry the same fields.
export function fromFcmPayload(payload = {}) {
    const n = payload.notification || {};
    const d = payload.data || {};
    return {
        title: n.title || d.title || '',
        body: n.body || d.body || '',
        link: payload.fcmOptions?.link || d.link || null,
    };
}
