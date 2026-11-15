import moment from 'moment';

// Frequencies (RecurringTransactionIntervals):
// 0 daily, 1 weekly, 2 monthly, 3 yearly           → interval = "every N <unit>"
// 4 last day of month, 5 first business day,
// 6 last business day                               → no interval
// 7 X-th day of month                               → interval = day of month (1–31)
export const STEP_FREQUENCIES = [0, 1, 2, 3];
export const NO_INTERVAL_FREQUENCIES = [4, 5, 6];
export const DAY_OF_MONTH_FREQUENCY = 7;
export const MAX_OCCURRENCES = 600;

const STEP_UNITS = { 0: 'days', 1: 'weeks', 2: 'months', 3: 'years' };

export function usesInterval(frequency) {
    return !NO_INTERVAL_FREQUENCIES.includes(frequency);
}

const isWeekday = (m) => m.isoWeekday() <= 5;

function firstBusinessDay(month) {
    const d = month.clone().startOf('month');
    while (!isWeekday(d)) d.add(1, 'day');
    return d;
}

function lastBusinessDay(month) {
    const d = month.clone().endOf('month').startOf('day');
    while (!isWeekday(d)) d.subtract(1, 'day');
    return d;
}

function dayOfMonth(month, day) {
    const m = month.clone().startOf('month');
    return m.date(Math.min(day, m.daysInMonth()));
}

// Monthly anchored rules: the first occurrence is in the start month if it is
// not before the start date, otherwise in the following month.
function monthlyRule(start, count, pick) {
    const out = [];
    let month = start.clone().startOf('month');
    if (pick(month).isBefore(start, 'day')) month.add(1, 'month');
    for (let i = 0; i < count; i++) {
        out.push(pick(month));
        month = month.clone().add(1, 'month');
    }
    return out;
}

/**
 * Returns the occurrence dates (Date[]) of a recurring item.
 * The time of day of `startDate` is kept on every occurrence.
 */
export function buildOccurrences({ startDate, frequency, interval, count }) {
    const n = Math.min(Number(count) || 0, MAX_OCCURRENCES);
    if (!startDate || n < 1) return [];
    const start = moment(startDate);
    const keepTime = (m) => m.clone().set({
        hour: start.hour(), minute: start.minute(), second: start.second(), millisecond: 0,
    });

    let dates;
    if (STEP_FREQUENCIES.includes(frequency)) {
        const step = Number(interval) || 0;
        if (step < 1) return [];
        // Always offset from the start date so month-end dates don't drift (31 Jan → 28 Feb → 31 Mar).
        dates = Array.from({ length: n }, (_, i) => start.clone().add(i * step, STEP_UNITS[frequency]));
    } else if (frequency === 4) {
        dates = monthlyRule(start, n, (m) => m.clone().endOf('month').startOf('day'));
    } else if (frequency === 5) {
        dates = monthlyRule(start, n, firstBusinessDay);
    } else if (frequency === 6) {
        dates = monthlyRule(start, n, lastBusinessDay);
    } else if (frequency === DAY_OF_MONTH_FREQUENCY) {
        const day = Number(interval) || 0;
        if (day < 1 || day > 31) return [];
        dates = monthlyRule(start, n, (m) => dayOfMonth(m, day));
    } else {
        return [];
    }
    return dates.map((d) => keepTime(d).toDate());
}

/** Counts the occurrences between start and end (used to prefill "count" when editing). */
export function countOccurrencesUntil({ startDate, frequency, interval, endDate }) {
    if (!endDate) return null;
    const end = moment(endDate).endOf('day');
    const all = buildOccurrences({ startDate, frequency, interval, count: MAX_OCCURRENCES });
    const n = all.filter((d) => !moment(d).isAfter(end)).length;
    return n > 0 ? n : null;
}
