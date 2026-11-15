// vue-select `calculatePosition` for `append-to-body` dropdowns.
// The list is rendered in <body> with `position: fixed`, so opening it never
// changes the height/scroll of the modal or card it lives in. It follows the
// toggle while scrolling and flips upwards when there is no room below.
const GAP = 4;
const EDGE = 8;
const MAX_MENU_HEIGHT = 304;

export function floatingDropdown(minWidth = 0) {
    return (list, component) => {
        const toggle = component.$refs.toggle || component.$el;

        const place = () => {
            const r = toggle.getBoundingClientRect();
            const width = Math.max(r.width, minWidth);
            const left = Math.min(Math.max(EDGE, r.left), window.innerWidth - width - EDGE);
            const menuHeight = Math.min(list.scrollHeight || MAX_MENU_HEIGHT, MAX_MENU_HEIGHT);
            const spaceBelow = window.innerHeight - r.bottom;
            const openUp = spaceBelow < menuHeight + GAP + EDGE && r.top > spaceBelow;

            list.style.position = 'fixed';
            list.style.width = `${width}px`;
            list.style.left = `${left}px`;
            if (openUp) {
                list.style.top = 'auto';
                list.style.bottom = `${window.innerHeight - r.top + GAP}px`;
            } else {
                list.style.bottom = 'auto';
                list.style.top = `${r.bottom + GAP}px`;
            }
        };

        place();
        // Re-measure once the list is in the DOM and its real height is known.
        const raf = requestAnimationFrame(place);
        window.addEventListener('scroll', place, true);
        window.addEventListener('resize', place);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('scroll', place, true);
            window.removeEventListener('resize', place);
        };
    };
}
