

import i18n from 'i18next';
import { initReactI18next } from "react-i18next";

import langEN from '../assets/translations/en.json';
import langTH from '../assets/translations/th.json';

i18n
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
        resources: {
            en: {
                translation: langEN
            },
            th: {
                translation: langTH
            }
        },
        lng: "th",

        keySeparator: false, // we do not use keys in form messages.welcome

        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });