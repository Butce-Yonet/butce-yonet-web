import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { tr, enUS } from 'date-fns/locale';

const localeMap = { tr, en: enUS };

export function useDateLocale() {
    const { locale } = useI18n();
    const dateLocale = computed(() => localeMap[locale.value] ?? enUS);
    return { dateLocale };
}
