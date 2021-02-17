import React from "react";

import {NavLink} from "react-router-dom";
import {getCurrentLocaleCode, isRtl, setCurrentLocaleCode} from "../locales/currentLocale";
import {LanguageSelectionScreen} from "./LanguageSelectionScreen";
import {allLocales} from "../locales/allLocales";
import {ActionLink} from "./ActionLink";
import {Flag} from "./Flag";
import {translate} from "../locales/translate";

export const Layout = ({children, title}) => {
    if (!getCurrentLocaleCode()) {
        return <div className={"ltr"}><LanguageSelectionScreen onLanguageSelected={setCurrentLocaleCode}/></div>;
    }

    return (
        <div className={`App ${isRtl() ? "rtl" : "ltr"}`}>
            <div className={"block"}>
                <NavLink className={"link nav-link"} exact={true} to={"/"}>{translate("Home")}</NavLink>
                <NavLink className={"link nav-link"} exact={true} to={"/create"}>{translate("Create New Project")}</NavLink>

                <div className={"nav-link float-right"}>
                    {allLocales.map(({code, name}) => (
                        <ActionLink key={code} className={"inline-block"} onClick={() => setCurrentLocaleCode(code)}>
                            <Flag code={code} name={name} size={"1em"}/>
                        </ActionLink>
                    ))}
                </div>
            </div>

            {title && <h1 className={"block"}>{title}</h1>}

            {children}
        </div>
    );
};
