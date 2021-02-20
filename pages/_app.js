import "../src/components/App.css";

import {useCallback,useState} from "react";
import {translate, translatePlural, translateWithContext} from "../src/locales/translate";
import {useWindow} from "../src/hooks/useWindow";
import {AppContext} from "../src/contexts/app";
import {RecentlyCreatedProjectsContext} from "../src/contexts/recentlyCreatedProjects";
import Head from "next/head";

const useLocaleCode = (localeCode, callback) => useCallback(
    (...args) => callback(localeCode || "en", ...args),
    [localeCode, callback]
);

// noinspection JSUnusedGlobalSymbols
export default function App({ Component, pageProps }) {
    const wnd = useWindow();

    const localeCode = wnd ? wnd.localStorage.locale || "" : undefined;

    const handleTranslate = useLocaleCode(localeCode, translate);
    const handleTranslateWithContext = useLocaleCode(localeCode, translateWithContext);
    const handleTranslatePlural = useLocaleCode(localeCode, translatePlural);

    const [recentlyCreatedProjects, setRecentlyCreatedProjects] = useState(() => ({}));
    const handleAddRecentlyCreatedProject = useCallback(
        (projectId) => setRecentlyCreatedProjects(v => ({...v, [projectId]: true})),
        [setRecentlyCreatedProjects]
    );
    const handleIsRecentlyCreatedProject = useCallback(
        (projectId) => !!recentlyCreatedProjects[projectId],
        [recentlyCreatedProjects]
    );

    return (
        <AppContext.Provider
            value={{
                isHead: localeCode === undefined,
                localeCode,
                translate: handleTranslate,
                translateWithContext: handleTranslateWithContext,
                translatePlural: handleTranslatePlural,
            }}
        >
            <RecentlyCreatedProjectsContext.Provider
                value={{
                    add: handleAddRecentlyCreatedProject,
                    is: handleIsRecentlyCreatedProject,
                }}
            >
                <Head>
                    <meta charSet="utf-8"/>
                    <link rel="icon" href="/favicon.png"/>
                    <meta name="viewport" content="width=device-width, initial-scale=1"/>
                    <meta name="theme-color" content="#ffffff"/>
                    <script src="/vendor/express-recorder.js"/>
                    <script src={`${process.env.NEXT_PUBLIC_CDN_URL}/p/${process.env.NEXT_PUBLIC_PARTNER_ID}/embedPlaykitJs/uiconf_id/${process.env.NEXT_PUBLIC_UI_CONF_ID}`}/>
                    <title/>
                </Head>

                <Component{...pageProps}/>
            </RecentlyCreatedProjectsContext.Provider>
        </AppContext.Provider>
    );
}
