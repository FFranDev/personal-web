import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import global_en from './locales/en/global.json';
import global_es from './locales/es/global.json';

i18n
  .use(initReactI18next)
  .init({
    interpolation: { escapeValue: false },
    lng: 'es', // Default language
    fallbackLng: 'es',
    resources: {
      en: {
        global: global_en
      },
      es: {
        global: global_es
      }
    }
  });

export default i18n;