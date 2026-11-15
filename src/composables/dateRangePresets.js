import moment from 'moment';

// `range` presets compute their own bounds; the rest are "last N <unit>" up to today.
export const dateRangePresets = [
    { key: 'thisMonth', label: 'header.dateRangePresets.thisMonth', range: () => [moment().startOf('month'), moment().endOf('month')] },
    { key: 'week', label: 'header.dateRangePresets.week', amount: 1, unit: 'weeks' },
    { key: 'month', label: 'header.dateRangePresets.month', amount: 1, unit: 'months' },
    { key: '3months', label: 'header.dateRangePresets.3months', amount: 3, unit: 'months' },
    { key: '6months', label: 'header.dateRangePresets.6months', amount: 6, unit: 'months' },
    { key: 'year', label: 'header.dateRangePresets.year', amount: 1, unit: 'years' },
];

export const defaultDateRangePresetKey = 'thisMonth';

export function getPresetRange(key) {
    const preset = dateRangePresets.find(p => p.key === key)
        || dateRangePresets.find(p => p.key === defaultDateRangePresetKey);

    if (preset.range) {
        const [start, end] = preset.range();
        return [start.startOf('day').toDate(), end.endOf('day').toDate()];
    }

    const end = moment().endOf('day').toDate();
    const start = moment().subtract(preset.amount, preset.unit).startOf('day').toDate();

    return [start, end];
}

export function getDefaultDateRange() {
    return getPresetRange(defaultDateRangePresetKey);
}

export function isDefaultDateRange(range) {
    const [start, end] = range || [];
    if (!start || !end) return false;
    const [defaultStart, defaultEnd] = getDefaultDateRange();
    return moment(start).isSame(defaultStart, 'day') && moment(end).isSame(defaultEnd, 'day');
}
