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

export const BUDGET_NOTIFICATION_TYPES = ['BudgetThresholdReached', 'BudgetExceeded'];

export function isBudgetNotification(payload = {}) {
    return BUDGET_NOTIFICATION_TYPES.includes(payload.data?.type);
}

// In-app link for typed notifications (all FCM data values are strings).
function linkFromData(d) {
    if (BUDGET_NOTIFICATION_TYPES.includes(d.type) && /^\d+$/.test(d.budgetId || '')) return `/budgets/${d.budgetId}`;
    return null;
}

// Normalises an FCM payload: "notification" messages and data-only messages carry the same fields.
export function fromFcmPayload(payload = {}) {
    const n = payload.notification || {};
    const d = payload.data || {};
    return {
        title: n.title || d.title || '',
        body: n.body || d.body || '',
        link: linkFromData(d) || payload.fcmOptions?.link || d.link || null,
    };
}
