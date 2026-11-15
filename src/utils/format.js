import moment from 'moment';
import i18n from '@/locales';

export const TX_INCOME = 0;
export const TX_EXPENSE = 1;
export const TX_SAVING = 2;

function currentLocale() {
    const l = i18n.global.locale;
    return (typeof l === 'string' ? l : l?.value) || 'tr';
}

function intlLocale() {
    return currentLocale() === 'tr' ? 'tr-TR' : 'en-US';
}

/**
 * Formats an amount as currency. Falls back to a plain number when no code.
 * @param {number} amount
 * @param {string} [code]
 * @param {{ compact?: boolean, decimals?: number }} [opts]
 */
export function formatMoney(amount, code, opts = {}) {
    if (amount == null || Number.isNaN(Number(amount))) return '—';
    const decimals = opts.decimals ?? 2;
    const base = {
        minimumFractionDigits: opts.compact ? 0 : decimals,
        maximumFractionDigits: decimals,
    };
    if (opts.compact) {
        base.notation = 'compact';
        base.maximumFractionDigits = 1;
    }
    try {
        if (code) {
            return new Intl.NumberFormat(intlLocale(), { style: 'currency', currency: code, ...base }).format(amount);
        }
    } catch {
        // unknown currency code — fall through to plain number
    }
    const n = new Intl.NumberFormat(intlLocale(), base).format(amount);
    return code ? `${n} ${code}` : n;
}

export function formatNumber(value, decimals = 2) {
    if (value == null) return '—';
    return new Intl.NumberFormat(intlLocale(), {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(value);
}

export function formatDate(date, pattern = 'D MMM YYYY') {
    if (!date) return '—';
    return moment(date).locale(currentLocale()).format(pattern);
}

export function formatRelative(date) {
    if (!date) return '';
    return moment(date).locale(currentLocale()).fromNow();
}

/** "Bugün", "Dün" or a formatted day heading. */
export function formatDayHeading(date) {
    const m = moment(date).locale(currentLocale());
    const today = moment().startOf('day');
    const diff = today.diff(m.clone().startOf('day'), 'days');
    if (diff === 0) return i18n.global.t('common.today');
    if (diff === 1) return i18n.global.t('common.yesterday');
    if (m.year() === today.year()) return m.format('D MMMM, dddd');
    return m.format('D MMMM YYYY, dddd');
}

export function formatRange(range) {
    const [start, end] = range || [];
    if (!start || !end) return '';
    const s = moment(start).locale(currentLocale());
    const e = moment(end).locale(currentLocale());
    if (s.year() === e.year()) {
        if (s.month() === e.month()) return `${s.format('D')} – ${e.format('D MMM YYYY')}`;
        return `${s.format('D MMM')} – ${e.format('D MMM YYYY')}`;
    }
    return `${s.format('D MMM YYYY')} – ${e.format('D MMM YYYY')}`;
}

export function txTone(type) {
    if (type === TX_INCOME) return 'income';
    if (type === TX_SAVING) return 'saving';
    return 'expense';
}

export function txIcon(type) {
    if (type === TX_INCOME) return 'arrow-down-left';
    if (type === TX_SAVING) return 'target';
    return 'arrow-up-right';
}

export function txSign(type) {
    return type === TX_EXPENSE ? '−' : '+';
}

export function initials(name) {
    const parts = (name || '').trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return (name || '?').slice(0, 2).toUpperCase();
}

/** Returns a soft background (hex + alpha) for a label color. */
export function softColor(hex, alpha = '1f') {
    if (!hex || typeof hex !== 'string' || !hex.startsWith('#') || hex.length !== 7) return undefined;
    return hex + alpha;
}

export function toStartOfDayISO(date) {
    return date ? moment(date).startOf('day').toISOString() : null;
}

export function toEndOfDayISO(date) {
    return date ? moment(date).endOf('day').toISOString() : null;
}

export function frequencyOptions(t) {
    return [
        { value: 0, text: t('common.frequency.daily') },
        { value: 1, text: t('common.frequency.weekly') },
        { value: 2, text: t('common.frequency.monthly') },
        { value: 3, text: t('common.frequency.yearly') },
        { value: 4, text: t('common.frequency.lastDayOfTheMonth') },
        { value: 5, text: t('common.frequency.firstBusinessDayOfTheMonth') },
        { value: 6, text: t('common.frequency.lastBusinessDayOfTheMonth') },
        { value: 7, text: t('common.frequency.xTHOfTheMonth') },
    ];
}

/** Human readable "Every 2 months" / "On day 15 of each month" text. */
export function describeFrequency(t, frequency, interval) {
    const n = interval == null ? null : Number(interval);
    switch (frequency) {
        case 0: return n && n > 1 ? t('frequencyText.everyNDays', { n }) : t('common.frequency.daily');
        case 1: return n && n > 1 ? t('frequencyText.everyNWeeks', { n }) : t('common.frequency.weekly');
        case 2: return n && n > 1 ? t('frequencyText.everyNMonths', { n }) : t('common.frequency.monthly');
        case 3: return n && n > 1 ? t('frequencyText.everyNYears', { n }) : t('common.frequency.yearly');
        case 4: return t('common.frequency.lastDayOfTheMonth');
        case 5: return t('common.frequency.firstBusinessDayOfTheMonth');
        case 6: return t('common.frequency.lastBusinessDayOfTheMonth');
        case 7: return n ? t('frequencyText.dayOfMonth', { n }) : t('common.frequency.xTHOfTheMonth');
        default: return '';
    }
}

export function defaultCurrencyId(currencies) {
    const list = currencies || [];
    const byRank = list.find(c => c.rank === 1);
    if (byRank) return byRank.id;
    const byCode = list.find(c => c.code === 'TRY');
    return byCode ? byCode.id : (list[0]?.id ?? null);
}
