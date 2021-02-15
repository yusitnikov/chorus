export const phrasesById = {
    // region App
    "Home": {
        ru: "Главная",
        he: "דף הראשי",
    },
    "Create New Project": {
        ru: "Создать новый проект",
        he: "צור פרויקט חדש",
    },
    "Page not found": {
        ru: "Страница не найдена",
        he: "הדף לא נמצא",
    },
    // endregion

    // region HomePage
    "Welcome to the Chorus project!": {
        ru: "Добро пожаловать в проект Chorus!",
        he: "ברוכים הבאים לפרויקט Chorus!",
    },
    "Try creating a new project": {
        ru: "Попробуйте создать новый проект",
        he: "נסה ליצור פרויקט חדש",
    },
    // endregion

    // region ViewPage
    "Reply": {
        ru: "Ответить",
        he: "להגיב",
    },
    "%u related video": {
        ru: ["%u связанное видео", "%u связанных видео", "%u связанных видео"],
        he: ["%u סרטון קשור", "%u סרטונים קשורים"],
    },
    // endregion

    // region ReplyPage
    "Reply to ": {
        ru: "Ответить на ",
        he: "להגיב ל",
    },
    // endregion

    // region EntryNotReadyScreen
    "Processing the video, please wait...": {
        ru: "Видео обрабатывается, подождите...",
        he: "הסרטון מעובד, אנא המתן...",
    },
    // endregion

    // region SourceRecorder
    "Your video was submitted successfully. What's the name of the project?": {
        ru: "Ваше видео было успешно отправлено. Как называется проект?",
        he: "הסרטון שלך הוגש בהצלחה. מה שמו של הפרויקט?",
    },
    "Done": {
        ru: "Готово",
        he: "סיים",
    },
    "Type text...": {
        ru: "Введите текст...",
        he: "הקלד טקסט...",
    },
    // endregion

    // region ResponseRecorder
    "Your reply was submitted.": {
        ru: "Ваш ответ был отправлен.",
        he: "תגובתך הוגשה בהצלחה.",
    },
    "Record one more?": {
        ru: "Записать еще один?",
        he: "להקליט עוד אחת?",
    },
    // endregion

    // region Project
    "Source": {
        ru: "Оригинал",
        he: "מקור",
    },
    "Reply %1": {
        ru: "Ответ %1",
        he: "תגובה %1",
    },
    "Compilation": {
        ru: "Компиляция",
        he: "ההדרה",
    },
    // endregion

    // region Recorder
    "Video Recording": {
        ru: "Запись видео",
        he: "הקלטת וידאו",
    },
    "Audio Recording": {
        ru: "Запись аудио",
        he: "הקלטת שמע",
    },
    "Video and audio are disabled, at least one of them must be enabled.": {
        ru: "Видео и аудио отключены, должно быть включено хотя бы что-то одно.",
        he: "הווידאו והשמע מושבתים, יש להפעיל לפחות אחד מהם.",
    },
    "Start Recording": {
        ru: "Начать запись",
        he: "התחל להקליט",
    },
    "Cancel": {
        ru: "Отмена",
        he: "בטל",
    },
    "Download a Copy": {
        ru: "Загрузить копию",
        he: "הורד עותק",
    },
    "Record Again": {
        ru: "Записать снова",
        he: "הקלט שוב",
    },
    "Use This": {
        ru: "Использовать это",
        he: "השתמש בזה",
    },
    "Settings": {
        ru: "Настройки",
        he: "הגדרות",
    },
    "Camera Settings": {
        ru: "Настройки камеры",
        he: "הגדרות מצלמה",
    },
    "Audio Settings": {
        ru: "Настройки аудио",
        he: "הגדרות שמע",
    },
    "Camera": {
        ru: "Камера",
        he: "מצלמה",
    },
    "Audio": {
        ru: "Аудио",
        he: "שמע",
    },
    "Back to Settings": {
        ru: "Вернуться в настройки",
        he: "חזרה להגדרות",
    },
    "Upload Completed!": {
        ru: "Загрузка на сервер завершена!",
        he: "ההעלאה הושלמה!",
    },
    "Recording Audio Only": {
        ru: "Запись только аудио",
        he: "הקלטת שמע בלבד",
    },
    // endregion
};

const getPhrasesForLocale = (locale) => Object.fromEntries(Object.entries(phrasesById).map(([phraseId, translationsMap]) => [phraseId, translationsMap[locale]]));

export const phrasesByLocale = {
    ru: getPhrasesForLocale("ru"),
    he: getPhrasesForLocale("he"),
};
