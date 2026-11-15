<template>
  <div class="period" v-click-outside="close">
    <button
      type="button"
      class="btn btn-secondary period-trigger"
      :class="{ sm: small, 'btn-sm': small }"
      :aria-expanded="isOpen"
      @click="isOpen = !isOpen"
    >
      <vue-feather type="calendar" size="15"></vue-feather>
      <span class="period-label">{{ label }}</span>
      <vue-feather type="chevron-down" size="14" class="period-caret" :class="{ open: isOpen }"></vue-feather>
    </button>

    <transition name="pop">
      <div v-if="isOpen" class="menu period-menu" :class="'align-' + align">
        <div class="period-presets">
          <div class="menu-label">{{ $t('period.quick') }}</div>
          <button
            v-for="p in presets"
            :key="p.key"
            type="button"
            class="menu-item"
            :class="{ active: activeKey === p.key }"
            @click="selectPreset(p.key)"
          >
            <span class="menu-text">{{ $t(p.label) }}</span>
            <vue-feather v-if="activeKey === p.key" type="check" size="15"></vue-feather>
          </button>
        </div>
        <div class="period-custom">
          <div class="menu-label">{{ $t('period.custom') }}</div>
          <VueDatePicker
            :model-value="modelValue"
            range
            inline
            auto-apply
            :time-config="{ enableTimePicker: false }"
            :locale="dateLocale"
            :month-change-on-scroll="false"
            @update:model-value="onCustom"
          />
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import moment from 'moment';
import { dateRangePresets, getPresetRange } from '@/composables/dateRangePresets';
import { useDateLocale } from '@/composables/useDateLocale';
import { formatRange } from '@/utils/format';

export default {
  name: 'PeriodPicker',
  props: {
    modelValue: { type: Array, default: () => [null, null] },
    small: { type: Boolean, default: false },
    align: { type: String, default: 'left' },
  },
  emits: ['update:modelValue'],
  setup() {
    const { dateLocale } = useDateLocale();
    return { dateLocale };
  },
  data() {
    return { isOpen: false, presets: dateRangePresets };
  },
  computed: {
    activeKey() {
      const [start, end] = this.modelValue || [];
      if (!start || !end) return null;
      const match = this.presets.find((p) => {
        const [ps, pe] = getPresetRange(p.key);
        return moment(start).isSame(ps, 'day') && moment(end).isSame(pe, 'day');
      });
      return match ? match.key : null;
    },
    label() {
      if (this.activeKey) {
        return this.$t(this.presets.find((p) => p.key === this.activeKey).label);
      }
      return formatRange(this.modelValue) || this.$t('period.select');
    },
  },
  methods: {
    close() {
      this.isOpen = false;
    },
    selectPreset(key) {
      this.$emit('update:modelValue', getPresetRange(key));
      this.close();
    },
    onCustom(val) {
      if (Array.isArray(val) && val[0] && val[1]) {
        this.$emit('update:modelValue', [
          moment(val[0]).startOf('day').toDate(),
          moment(val[1]).endOf('day').toDate(),
        ]);
        this.close();
      }
    },
  },
};
</script>

<style scoped>
.period {
  position: relative;
  display: inline-flex;
}

.period-trigger {
  max-width: 100%;
}

.period-label {
  overflow: hidden;
  text-overflow: ellipsis;
}

.period-caret {
  color: var(--text-3);
  transition: transform 0.15s;
}

.period-caret.open {
  transform: rotate(180deg);
}

.period-menu {
  top: calc(100% + 6px);
  display: flex;
  gap: 4px;
  padding: 8px;
  min-width: 0;
}

.align-left { left: 0; }
.align-right { right: 0; }

.period-presets {
  width: 170px;
  flex-shrink: 0;
  border-right: 1px solid var(--border);
  padding-right: 6px;
}

.period-custom {
  padding-left: 4px;
}

.period-custom :deep(.dp__menu) {
  border: 0;
  box-shadow: none;
}

.period-custom :deep(.dp__menu_inner) {
  padding: 0;
}

@media (max-width: 640px) {
  .period-menu {
    position: fixed;
    left: 8px !important;
    right: 8px !important;
    top: auto;
    bottom: calc(8px + env(safe-area-inset-bottom));
    flex-direction: column;
    max-height: 80vh;
    overflow-y: auto;
    z-index: 1200;
  }

  .period-presets {
    width: auto;
    border-right: 0;
    border-bottom: 1px solid var(--border);
    padding: 0 0 6px;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .period-presets .menu-label {
    grid-column: 1 / -1;
  }

  .period-custom {
    padding: 4px 0 0;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .period-custom .menu-label {
    align-self: flex-start;
  }
}
</style>
