// Lightweight CSS tooltip: renders via [data-tip]::after (see _components.scss)
function apply(el, value) {
    if (value) {
        el.setAttribute('data-tip', value);
        if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', value);
    } else {
        el.removeAttribute('data-tip');
    }
}

export const tooltipDirective = {
    mounted(el, binding) {
        apply(el, binding.value);
    },
    updated(el, binding) {
        if (binding.value !== binding.oldValue) apply(el, binding.value);
    },
};

export const clickOutsideDirective = {
    mounted(el, binding) {
        el._clickOutside = (e) => {
            if (!el.contains(e.target)) binding.value(e);
        };
        document.addEventListener('mousedown', el._clickOutside);
        document.addEventListener('touchstart', el._clickOutside, { passive: true });
    },
    beforeUnmount(el) {
        document.removeEventListener('mousedown', el._clickOutside);
        document.removeEventListener('touchstart', el._clickOutside);
    },
};
