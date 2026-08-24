<template>
    <div class="date-preset-group" role="group">
        <button
            v-for="p in presets"
            :key="p.key"
            type="button"
            class="date-preset-btn"
            :class="{ active: isActive(p.key) }"
            @click="select(p.key)"
        >{{ $t(p.label) }}</button>
    </div>
</template>

<script>
import moment from 'moment';
import { dateRangePresets, getPresetRange } from '@/composables/dateRangePresets';

export default {
    name: 'DateRangePresetPicker',
    props: {
        modelValue: {
            type: Array,
            default: () => [null, null]
        }
    },
    emits: ['update:modelValue'],
    data() {
        return {
            presets: dateRangePresets
        };
    },
    methods: {
        select(key) {
            this.$emit('update:modelValue', getPresetRange(key));
        },
        isActive(key) {
            const [start, end] = this.modelValue || [];
            if (!start || !end) return false;
            const [pStart, pEnd] = getPresetRange(key);
            return moment(start).isSame(pStart, 'day') && moment(end).isSame(pEnd, 'day');
        }
    }
};
</script>

<style scoped>
.date-preset-group {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.date-preset-btn {
    padding: 5px 12px;
    border-radius: 20px;
    border: 1.5px solid #e5e7eb;
    background: #f9fafb;
    color: #6b7280;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
}

.date-preset-btn:hover {
    border-color: #10b981;
    color: #10b981;
    background: #f0fdf4;
}

.date-preset-btn.active {
    border-color: #10b981;
    background: #10b981;
    color: #fff;
}
</style>
