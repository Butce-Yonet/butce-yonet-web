import moment from 'moment';

/**
 * Mirrors the backend's status derivation (see subscription-feature.md):
 * 1. Paid    -> lastPaidDate within the last 3 days
 * 2. Overdue -> (else) nextOccurrence is before today
 * 3. Upcoming-> (else) nextOccurrence is within [today, today+7]
 * 4. null    -> none of the above (only shows up in the "All" tab)
 */
export function computeSubscriptionStatus(subscription) {
    const today = moment().startOf('day');

    if (subscription.lastPaidDate) {
        const daysSincePaid = today.diff(moment(subscription.lastPaidDate).startOf('day'), 'days');
        if (daysSincePaid >= 0 && daysSincePaid <= 3) return 'Paid';
    }

    if (subscription.nextOccurrence) {
        const nextOccurrence = moment(subscription.nextOccurrence).startOf('day');
        if (nextOccurrence.isBefore(today)) return 'Overdue';
        if (nextOccurrence.isSameOrBefore(today.clone().add(7, 'days'))) return 'Upcoming';
    }

    return null;
}

export const subscriptionStatuses = ['Upcoming', 'Paid', 'Overdue'];
