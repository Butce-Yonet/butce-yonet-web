export const CHART_PALETTE = [
    '#10b981', '#6366f1', '#f59e0b', '#ef4444', '#06b6d4',
    '#ec4899', '#84cc16', '#8b5cf6', '#f97316', '#14b8a6',
    '#3b82f6', '#a855f7', '#eab308', '#22c55e', '#f43f5e',
];

export const OTHER_COLOR = '#94a3b8';

/** Reads theme-aware colors from CSS custom properties. */
export function themeColors() {
    const s = getComputedStyle(document.documentElement);
    const v = (name, fallback) => (s.getPropertyValue(name) || '').trim() || fallback;
    return {
        text: v('--text', '#0f172a'),
        text2: v('--text-2', '#475569'),
        text3: v('--text-3', '#8a94a6'),
        border: v('--border', '#e6e8ec'),
        surface: v('--surface', '#ffffff'),
        font: v('--font', 'Inter, sans-serif'),
    };
}

export function baseTooltip(colors) {
    return {
        backgroundColor: '#0f172a',
        titleColor: '#f8fafc',
        bodyColor: '#e2e8f0',
        borderWidth: 0,
        padding: 10,
        cornerRadius: 8,
        boxPadding: 4,
        titleFont: { family: colors.font, weight: '600', size: 12 },
        bodyFont: { family: colors.font, size: 12 },
    };
}
