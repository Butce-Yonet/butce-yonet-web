import moment from 'moment';
import i18n from '@/locales';

export const BUDGET_ON_TRACK = 1;
export const BUDGET_WARNING = 2;
export const BUDGET_EXCEEDED = 3;

/** Visual tone for a budget status. Always derive color from `status`, never from `percentage`. */
export function budgetTone(status) {
    if (status === BUDGET_EXCEEDED) return 'danger';
    if (status === BUDGET_WARNING) return 'warning';
    return 'success';
}

function intlLocale() {
    const l = i18n.global.locale;
    const code = (typeof l === 'string' ? l : l?.value) || 'tr';
    return code === 'tr' ? 'tr-TR' : 'en-US';
}

/** Formats an amount with the currency's own symbol and position (CurrencyDto). */
export function formatBudgetMoney(amount, currency, decimals = 2) {
    if (amount == null || Number.isNaN(Number(amount))) return '—';
    const n = new Intl.NumberFormat(intlLocale(), {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(amount);
    if (!currency?.symbol) return currency?.code ? `${n} ${currency.code}` : n;
    return currency.isSymbolRight ? `${n} ${currency.symbol}` : `${currency.symbol}${n}`;
}

export function formatPercent(value) {
    return new Intl.NumberFormat(intlLocale(), { maximumFractionDigits: 1 }).format(value || 0);
}

/**
 * The API sends calendar days without a time zone ("2026-11-15T00:00:00").
 * Parse only the date part as a local day so nothing shifts through UTC.
 */
export function parseBudgetDay(value) {
    if (!value) return null;
    return moment(String(value).slice(0, 10), 'YYYY-MM-DD');
}

export function budgetDayKey(value) {
    return value ? String(value).slice(0, 10) : '';
}

/** "1 Kas – 30 Kas" (periodEnd is inclusive). */
export function formatBudgetPeriod(start, end) {
    const s = parseBudgetDay(start);
    const e = parseBudgetDay(end);
    if (!s || !e) return '';
    const locale = i18n.global.locale;
    const sameYear = s.year() === e.year() && s.year() === moment().year();
    const fmt = sameYear ? 'D MMM' : 'D MMM YYYY';
    return `${s.locale(locale).format(fmt)} – ${e.locale(locale).format(fmt)}`;
}

/** Same rule as the server's BudgetPeriodCalculator.GetPeriod (preview only). */
export function previewPeriod(startDay, today = new Date()) {
    const y = today.getFullYear();
    const m = today.getMonth();
    const d = today.getDate();
    const start = d >= startDay ? new Date(y, m, startDay) : new Date(y, m - 1, startDay);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, startDay - 1);
    return { start, end };
}

export const PERIOD_START_DAYS = Array.from({ length: 28 }, (_, i) => i + 1);

/** Unique key for a (label | general, currency) combination; one budget per combination. */
export function budgetComboKey(labelId, currencyId) {
    return `${labelId ?? 'general'}_${currencyId}`;
}
