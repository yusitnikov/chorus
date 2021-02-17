import React from "react";

import "./App.css";

import {HashRouter, Route, Switch} from "react-router-dom";
import {HomePage} from "./pages/HomePage";
import {CreatePage} from "./pages/CreatePage";
import {ReplyPage} from "./pages/ReplyPage";
import {ViewPage} from "./pages/ViewPage";
import {PageNotFound} from "./errors/PageNotFound";

export const App = () => (
    <HashRouter>
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
                <PageNotFound/>
            </Route>
        </Switch>
    </HashRouter>
);
