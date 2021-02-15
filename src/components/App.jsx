import React from "react";

import "./App.css";

import {HashRouter, NavLink, Route, Switch} from "react-router-dom";
import {HomePage} from "./pages/HomePage";
import {CreatePage} from "./pages/CreatePage";
import {ReplyPage} from "./pages/ReplyPage";
import {ViewPage} from "./pages/ViewPage";
import {getCurrentLocaleCode, isRtl, setCurrentLocaleCode} from "../locales/currentLocale";
import {LanguageSelectionScreen} from "./LanguageSelectionScreen";
import {allLocales} from "../locales/allLocales";
import {ActionLink} from "./ActionLink";
import {Flag} from "./Flag";
import {translate} from "../locales/translate";

export const App = () => {
    if (!getCurrentLocaleCode()) {
        return <div className={"ltr"}><LanguageSelectionScreen onLanguageSelected={setCurrentLocaleCode}/></div>;
    }

    return (
        <HashRouter>
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

                <Switch>
                    <Route exact={true} path={"/"}>
                        <HomePage/>
                    </Route>
                    <Route exact={true} path={"/create"}>
                        <CreatePage/>
                    </Route>
                    <Route exact={true} path={"/view/:projectId/:entryId?"}>
                        <ViewPage/>
                    </Route>
                    <Route exact={true} path={"/reply/:projectId"}>
                        <ReplyPage/>
                    </Route>
                    <Route path={"*"}>
                        {translate("Page not found")}
                    </Route>
                </Switch>
            </div>
        </HashRouter>
    );
};
