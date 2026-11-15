import { reactive } from 'vue';

let seq = 0;

export const toastState = reactive({ items: [] });

function push(type, message, opts = {}) {
    if (!message) return;
    const id = ++seq;
    const item = {
        id,
        type,
        message,
        action: opts.action || null,
        duration: opts.duration ?? (type === 'error' ? 5000 : 3200),
    };
    toastState.items.push(item);
    if (toastState.items.length > 4) toastState.items.shift();
    if (item.duration > 0) {
        setTimeout(() => dismiss(id), item.duration);
    }
    return id;
}

export function dismiss(id) {
    const idx = toastState.items.findIndex(t => t.id === id);
    if (idx > -1) toastState.items.splice(idx, 1);
}

export const toast = {
    success: (msg, opts) => push('success', msg, opts),
    error: (msg, opts) => push('error', msg, opts),
    info: (msg, opts) => push('info', msg, opts),
    dismiss,
};

export default {
    install(app) {
        app.config.globalProperties.$toast = toast;
    },
};
