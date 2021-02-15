import {phrasesById} from "./phrases";
import {getCurrentLocaleCode, getCurrentLocaleObject} from "./currentLocale";
import {getDefaultPluralFormIndex} from "./allLocales";

const substituteArgs = (messageId, ...args) => {
    for (const [index, arg] of args.entries()) {
        messageId = messageId.replace(new RegExp(`%${index + 1}`, "g"), arg);
    }

    return messageId;
};

export const translate = (messageId, ...args) => substituteArgs(phrasesById[messageId] && phrasesById[messageId][getCurrentLocaleCode()] || messageId, ...args);

export const translatePlural = (n, messageIdSingle, messageIdPlural, ...args) => {
    let messageIdForms = translate(messageIdSingle);

    if (typeof messageIdForms === "string") {
        messageIdForms = [messageIdSingle, messageIdPlural, messageIdPlural];
    }

    const messageFormIndex = (getCurrentLocaleObject()?.getPluralFormIndex || getDefaultPluralFormIndex)(n);

    return substituteArgs((messageIdForms[messageFormIndex] || messageIdPlural).replace(/%u/g, n), ...args);
};
