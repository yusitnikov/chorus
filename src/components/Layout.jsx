import React from "react";

import {NavLink} from "react-router-dom";
import {getCurrentLocaleCode, isRtl, setCurrentLocaleCode} from "../locales/currentLocale";
import {LanguageSelectionScreen} from "./LanguageSelectionScreen";
import {allLocales} from "../locales/allLocales";
import {ActionLink} from "./ActionLink";
import {Flag} from "./Flag";
import {translate} from "../locales/translate";
import {createProjectUrl, homePageUrl} from "../misc/url";
import {usePageTitle} from "../hooks/usePageTitle";
import {InlineBlocksHolder} from "./InlineBlocksHolder";

export const Layout = ({children, title, plainTitle}) => {
    usePageTitle(plainTitle || title);

    if (!getCurrentLocaleCode()) {
        return <div className={"ltr"}><LanguageSelectionScreen onLanguageSelected={setCurrentLocaleCode}/></div>;
    }

    return (
        <div className={`App ${isRtl() ? "rtl" : "ltr"}`}>
            <div className={"block input-padding"} style={{backgroundColor: "#eee"}}>
                <NavLink className={"link nav-link inline-margin"} exact={true} to={homePageUrl}>
                    <span className={"desktop-only"}>{translate("About the Chorus service")}</span>
                    <span className={"mobile-only"}>{translate("About the service")}</span>
                </NavLink>

                <NavLink className={"link nav-link inline-margin"} exact={true} to={createProjectUrl}>
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
