import i18n from '@/locales';

/** User-facing text for a BudgetApiError. Technical server messages are never shown. */
export function budgetErrorText(err) {
    const t = i18n.global.t;
    switch (err?.kind) {
        case 'alreadyExists': return t('budgets.errors.alreadyExists');
        case 'notFound': return t('budgets.errors.notFound');
        case 'forbidden': return t('budgets.errors.forbidden');
        case 'validation': return t('budgets.errors.validation');
        case 'network': return t('budgets.errors.network');
        default: return t('budgets.errors.generic');
    }
}
