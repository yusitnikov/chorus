import {allLocales} from "./allLocales";

export const getCurrentLocaleCode = () => window.localStorage.locale;

export const setCurrentLocaleCode = (code) => {
    window.localStorage.locale = code;
    window.location.reload();
};

export const getCurrentLocaleObject = () => {
    const code = getCurrentLocaleCode();

    return allLocales.filter(localeObject => localeObject.code === code)[0] || {};
};

export const isRtl = () => !!getCurrentLocaleObject().isRtl;
