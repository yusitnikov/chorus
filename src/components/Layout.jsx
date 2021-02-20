import React from "react";

import {isRtl, setCurrentLocaleCode} from "../locales/currentLocale";
import {LanguageSelectionScreen} from "./LanguageSelectionScreen";
import {allLocales} from "../locales/allLocales";
import {ActionLink} from "./ActionLink";
import {Flag} from "./Flag";
import {createProjectUrl, homePageUrl} from "../misc/url";
import {InlineBlocksHolder} from "./InlineBlocksHolder";
import Head from "next/head";
import {useRouter} from "next/router";
import Link from "next/link";
import {useIsHead, useLocaleCode, useTranslate} from "../contexts/app";

export const Layout = ({children, title, plainTitle = title, image}) => {
    const localeCode = useLocaleCode();

    return (
        <>
            <LayoutHead
                title={title}
                plainTitle={plainTitle}
                image={image}
            />

            {localeCode === "" && <LanguageSelectionLayout/>}
            {localeCode !== "" && <ContentLayout title={title}>{children}</ContentLayout>}
        </>
    )
};

export const LayoutHead = ({title, plainTitle = title, image}) => {
    const isHead = useIsHead();

    const fullPlainTitle = plainTitle ? `${plainTitle} - Chorus` : "Chorus";

    return (
        <Head>
            <title>{isHead ? "" : fullPlainTitle}</title>
            <meta property="og:title" content={fullPlainTitle}/>
            <meta property="og:image" content={image || `${process.env.NEXT_PUBLIC_ORIGIN}/favicon.png`}/>
        </Head>
    );
};

const LanguageSelectionLayout = () => {
    return <div className={"ltr"}><LanguageSelectionScreen onLanguageSelected={setCurrentLocaleCode}/></div>;
};

const NavLink = ({to, children}) => {
    const router = useRouter();

    return (
        <Link href={to}>
            <a className={`link nav-link inline-margin ${router.pathname === to ? "active" : ""}`}>
                {children}
            </a>
        </Link>
    )
};

const ContentLayout = ({children, title}) => {
    const translate = useTranslate();
    const isHead = useIsHead();

    if (isHead) {
        return null;
    }

    return (
        <div className={`App ${isRtl() ? "rtl" : "ltr"}`}>
            <div className={"block input-padding"} style={{backgroundColor: "#eee"}}>
                <NavLink to={homePageUrl}>
                    <span className={"desktop-only"}>{translate("About the Chorus service")}</span>
                    <span className={"mobile-only"}>{translate("About the service")}</span>
                </NavLink>

                <NavLink to={createProjectUrl}>
                    <span className={"desktop-only"}>{translate("Create New Project")}</span>
                    <span className={"mobile-only"}>{translate("New Project")}</span>
                </NavLink>

                <InlineBlocksHolder className={"nav-link float-right"}>
                    {allLocales.map(({code, name}) => (
                        <ActionLink key={code} className={"inline-margin"} onClick={() => setCurrentLocaleCode(code)}>
                            <Flag code={code} name={name} size={"1em"}/>
                        </ActionLink>
                    ))}
                </InlineBlocksHolder>

                <div className={"clear-both"}/>
            </div>

            <div className={"block input-padding"}>
                <div className={"relative"}>
                    {title && <h1 className={"block"}>{title}</h1>}

                    {children}
                </div>
            </div>

            <div className={"clear-both"} style={{height: 50}}/>
        </div>
    );
};
