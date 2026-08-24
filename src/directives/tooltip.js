import * as bootstrap from 'bootstrap';

export const tooltipDirective = {
    mounted(el, binding) {
        el._tooltip = new bootstrap.Tooltip(el, {
            title: binding.value,
            placement: binding.arg || 'top',
            trigger: 'hover',
        });
    },
    updated(el, binding) {
        if (el._tooltip) {
            el._tooltip.dispose();
        }
        el._tooltip = new bootstrap.Tooltip(el, {
            title: binding.value,
            placement: binding.arg || 'top',
            trigger: 'hover',
        });
    },
    beforeUnmount(el) {
        if (el._tooltip) {
            el._tooltip.dispose();
            el._tooltip = null;
        }
    },
};
