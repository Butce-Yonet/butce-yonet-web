import { createI18n } from 'vue-i18n';
import en from '@/locales/en.json';
import tr from '@/locales/tr.json';
import { defaultLocale, localeOptions } from '@/constants/config';

const messages = { en: en, tr: tr };
const locale = (localStorage.getItem('currentLanguage') && localeOptions.filter(x => x.id === localStorage.getItem('currentLanguage')).length > 0) ? localStorage.getItem('currentLanguage') : defaultLocale;


export default createI18n({
    locale: locale,
    fallbackLocale: defaultLocale,
    messages,
});