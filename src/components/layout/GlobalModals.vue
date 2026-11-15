<template>
  <div class="global-modals">
    <transaction-modal
      :open="modal.type === 'transaction'"
      :mode="modal.mode"
      :data="modal.data"
      @close="close"
      @saved="(opts) => saved(['transactions'], opts)"
    />
    <recurring-transaction-modal
      :open="modal.type === 'recurring'"
      :mode="modal.mode"
      :data="modal.data"
      @close="close"
      @saved="saved(['recurring', 'transactions'])"
    />
    <subscription-modal
      :open="modal.type === 'subscription'"
      :mode="modal.mode"
      :data="modal.data"
      @close="close"
      @saved="saved(['subscriptions'])"
    />
    <subscription-pay-modal
      :open="modal.type === 'subscriptionPay'"
      :data="modal.data"
      @close="close"
      @saved="saved(['subscriptions', 'transactions'])"
    />
    <goal-modal
      :open="modal.type === 'goal'"
      :mode="modal.mode"
      :data="modal.data"
      @close="close"
      @saved="saved(['goals'])"
    />
    <goal-contribute-modal
      :open="modal.type === 'goalContribute'"
      :data="modal.data"
      @close="close"
      @saved="saved(['goals', 'transactions'])"
    />
    <label-modal
      :open="modal.type === 'label'"
      :mode="modal.mode"
      :data="modal.data"
      @close="close"
      @saved="labelSaved"
    />
  </div>
</template>

<script>
import TransactionModal from '@/components/transaction/transactionModal.vue';
import RecurringTransactionModal from '@/components/recurringtransaction/recurringTransactionModal.vue';
import SubscriptionModal from '@/components/subscription/subscriptionModal.vue';
import SubscriptionPayModal from '@/components/subscription/subscriptionPayModal.vue';
import GoalModal from '@/components/goal/goalModal.vue';
import GoalContributeModal from '@/components/goal/goalContributeModal.vue';
import LabelModal from '@/components/label/labelModal.vue';

export default {
  name: 'GlobalModals',
  components: {
    TransactionModal,
    RecurringTransactionModal,
    SubscriptionModal,
    SubscriptionPayModal,
    GoalModal,
    GoalContributeModal,
    LabelModal,
  },
  computed: {
    modal() {
      return this.$store.state.ui.modal;
    },
  },
  methods: {
    close() {
      this.$store.dispatch('ui/closeModal');
    },
    saved(scopes, opts = {}) {
      this.$store.dispatch('ui/bump', scopes);
      if (!opts.keepOpen) this.close();
    },
    async labelSaved() {
      try {
        await this.$store.dispatch('dashboard/loadLabels', { force: true });
      } catch {
        // label list refresh failure is non-blocking
      }
      this.saved(['labels', 'transactions']);
    },
  },
};
</script>
