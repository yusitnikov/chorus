export const getDefaultPluralFormIndex = n => n === 1 ? 0 : 1;

export const allLocales = [
    {
        code: "en",
        name: "English",
    },
    {
        code: "ru",
        name: "Русский",
        getPluralFormIndex: n => n % 10 === 1 && n % 100 !== 11
            ? 0
            : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)
                ? 1
                : 2,
    },
    {
        code: "he",
        name: "עברית",
        isRtl: true,
    },
];
