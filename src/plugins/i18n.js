import { createI18n } from 'vue-i18n'
import en from '../locales/en'

const messages = {
    en: en
}

const i18n = createI18n({
    locale: 'en',
    fallbackLocale: 'ja',
    legacy: false,
    messages
})



export default i18n