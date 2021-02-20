import {phrasesById} from "./phrases";
import {getCurrentLocaleObject} from "./currentLocale";
import {getDefaultPluralFormIndex} from "./allLocales";

const substituteArgs = (messageId, ...args) => {
    for (const [index, arg] of args.entries()) {
        messageId = messageId.replace(new RegExp(`%${index + 1}`, "g"), arg);
    }

    return messageId;
};

export const translate = (localeCode, messageId, ...args) => {
    const translations = phrasesById[messageId];

    if (!translations) {
        console.warn(`Warning: translation is missing for the phrase "${messageId}"`);
    }

    return substituteArgs(translations && translations[localeCode] || messageId, ...args);
};

export const translateWithContext = (localeCode, messageId, contextId, ...args) => {
    const fullMessageId = `${messageId}|${contextId}`;
    let translation = translate(localeCode, fullMessageId);
    if (translation === fullMessageId) {
        translation = messageId;
    }
    return substituteArgs(translation, ...args);
};

export const translatePlural = (localeCode, n, messageIdSingle, messageIdPlural, ...args) => {
    let messageIdForms = translate(localeCode, messageIdSingle);

    if (typeof messageIdForms === "string") {
        messageIdForms = [messageIdSingle, messageIdPlural, messageIdPlural];
    }

    const messageFormIndex = (getCurrentLocaleObject()?.getPluralFormIndex || getDefaultPluralFormIndex)(n);

    return substituteArgs((messageIdForms[messageFormIndex] || messageIdPlural).replace(/%u/g, n), ...args);
};
