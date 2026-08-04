<template>
  <li class="add-transaction-nav" ref="nav">
    <div class="add-trigger" @click="isOpen = !isOpen" :class="{ active: isOpen }">
      <i class="fa fa-plus add-icon"></i>
    </div>

    <div class="add-dropdown" v-show="isOpen">
      <div class="add-item" @click="openTransactionModal">
        <div class="add-item-icon icon-transaction">
          <i class="fa fa-credit-card"></i>
        </div>
        <span>{{ $t('header.newTransaction') }}</span>
      </div>
      <div class="add-item" @click="openRecurringTransactionModal">
        <div class="add-item-icon icon-recurring">
          <i class="fa fa-repeat"></i>
        </div>
        <span>{{ $t('header.newRecurringTransaction') }}</span>
      </div>
      <div class="add-item" @click="openLabelsPage">
        <div class="add-item-icon icon-label">
          <i class="fa fa-tag"></i>
        </div>
        <span>{{ $t('header.newLabel') }}</span>
      </div>
    </div>
  </li>
</template>

<script>
export default {
  name: 'AddTransactionButton',
  data() {
    return { isOpen: false };
  },
  mounted() {
    document.addEventListener('click', this.handleOutsideClick);
  },
  unmounted() {
    document.removeEventListener('click', this.handleOutsideClick);
  },
  methods: {
    handleOutsideClick(e) {
      if (this.$refs.nav && !this.$refs.nav.contains(e.target)) {
        this.isOpen = false;
      }
    },
    openTransactionModal() {
      this.isOpen = false;
      if (this.$route.path === '/transactions') {
        this.$store.dispatch('dashboard/triggerOpenTransactionModal');
      } else {
        this.$store.dispatch('dashboard/setPendingOpenTransactionModal', true);
        this.$router.push('/transactions');
      }
    },
    openRecurringTransactionModal() {
      this.isOpen = false;
      if (this.$route.path === '/transactions') {
        this.$store.dispatch('dashboard/triggerOpenRecurringTransactionModal');
      } else {
        this.$store.dispatch('dashboard/setPendingOpenRecurringTransactionModal', true);
        this.$router.push('/transactions');
      }
    },
    openLabelsPage() {
      this.isOpen = false;
      if (this.$route.path === '/labels') {
        this.$store.dispatch('dashboard/setPendingOpenLabelModal', true);
      } else {
        this.$store.dispatch('dashboard/setPendingOpenLabelModal', true);
        this.$router.push('/labels');
      }
    },
  },
};
</script>

<style scoped>
.add-transaction-nav {
  position: relative;
  list-style: none;
  display: flex;
  align-items: center;
}

.add-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1.5px solid #e5e7eb;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.add-trigger:hover,
.add-trigger.active {
  border-color: #10b981;
  background: #f0fdf4;
}

.add-icon {
  font-size: 13px;
  color: #10b981;
  font-weight: 700;
}

.add-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 220px;
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  z-index: 9999;
  padding: 6px;
}

.add-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
}

.add-item:hover {
  background: #f0fdf4;
}

.add-item-icon {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 11px;
  flex-shrink: 0;
}

.icon-transaction { background: linear-gradient(135deg, #10b981, #059669); }
.icon-recurring   { background: linear-gradient(135deg, #3b82f6, #2563eb); }
.icon-label       { background: linear-gradient(135deg, #f59e0b, #d97706); }
</style>
