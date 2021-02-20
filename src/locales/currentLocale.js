import {allLocales} from "./allLocales";

export const getCurrentLocaleCode = () => "en";//window.localStorage.locale;

export const setCurrentLocaleCode = (code) => {
    window.localStorage.locale = code;
    window.location.reload();
};

export const getCurrentLocaleObject = () => {
    const localeCode = getCurrentLocaleCode();

    return allLocales.filter(localeObject => localeObject.code === localeCode)[0] || {};
};

export const isRtl = () => !!getCurrentLocaleObject().isRtl;
