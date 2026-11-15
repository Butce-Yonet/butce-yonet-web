// Primary navigation. `mobile: true` items appear in the bottom tab bar,
// the rest are grouped under "More" on small screens.
export const navItems = [
  { name: 'dashboard', path: '/', title: 'menu.home', icon: 'home', mobile: true },
  { name: 'transactions', path: '/transactions', title: 'menu.transactions', icon: 'repeat', mobile: true },
  { name: 'reports', path: '/reports', title: 'menu.reports', icon: 'pie-chart', mobile: true },
  { name: 'calendar', path: '/calendar', title: 'menu.calendar', icon: 'calendar' },
  { name: 'subscriptions', path: '/subscriptions', title: 'menu.bills', icon: 'file-text' },
  { name: 'budgets', path: '/budgets', title: 'menu.budgets', icon: 'sliders' },
  { name: 'goals', path: '/goals', title: 'menu.goals', icon: 'target' },
  { name: 'labels', path: '/labels', title: 'menu.labels', icon: 'tag' },
];

// Quick-add actions available from the header / FAB.
export const quickActions = [
  { type: 'transaction', title: 'header.newTransaction', desc: 'quickAdd.transactionDesc', icon: 'plus-circle', tone: 'brand', shortcut: 'N' },
  { type: 'recurring', title: 'header.newRecurringTransaction', desc: 'quickAdd.recurringDesc', icon: 'refresh-cw', tone: 'info' },
  { type: 'subscription', title: 'header.newSubscription', desc: 'quickAdd.subscriptionDesc', icon: 'file-text', tone: 'warning' },
  { type: 'budget', title: 'header.newBudget', desc: 'quickAdd.budgetDesc', icon: 'sliders', tone: 'warning' },
  { type: 'goal', title: 'header.newGoal', desc: 'quickAdd.goalDesc', icon: 'target', tone: 'saving' },
  { type: 'label', title: 'header.newLabel', desc: 'quickAdd.labelDesc', icon: 'tag', tone: 'neutral' },
];
