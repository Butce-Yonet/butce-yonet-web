import Swal from 'sweetalert2';
import i18n from '@/locales';

/**
 * Shows a styled confirmation dialog. Resolves true when confirmed.
 * @param {{ title: string, text?: string, confirmText?: string, danger?: boolean }} opts
 */
export async function confirmDialog(opts) {
    const t = i18n.global.t;
    const result = await Swal.fire({
        title: opts.title,
        text: opts.text || '',
        icon: opts.danger ? 'warning' : 'question',
        showCancelButton: true,
        reverseButtons: true,
        focusCancel: !!opts.danger,
        confirmButtonText: opts.confirmText || (opts.danger ? t('common.delete') : t('common.yes')),
        cancelButtonText: t('common.cancel'),
        customClass: { popup: opts.danger ? 'swal-danger' : '' },
    });
    return result.isConfirmed;
}

export function confirmDelete(title, text) {
    return confirmDialog({ title, text: text || i18n.global.t('common.cannotUndo'), danger: true });
}
