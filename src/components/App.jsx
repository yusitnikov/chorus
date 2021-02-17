import React from "react";

import "./App.css";

import {HashRouter, Route, Switch} from "react-router-dom";
import {HomePage} from "./pages/HomePage";
import {CreatePage} from "./pages/CreatePage";
import {ReplyPage} from "./pages/ReplyPage";
import {ViewPage} from "./pages/ViewPage";
import {EmbedPage} from "./pages/EmbedPage";
import {PageNotFound} from "./errors/PageNotFound";
import {createProjectUrl, homePageUrl, mediaEmbedUrl, replyUrl, viewProjectUrl} from "../misc/url";

export const App = () => (
    <HashRouter>
        <Switch>
            <Route exact={true} path={homePageUrl}>
                <HomePage/>
            </Route>
            <Route exact={true} path={createProjectUrl}>
                <CreatePage/>
            </Route>
            <Route exact={true} path={viewProjectUrl(":projectId", ":entryId?")}>
                <ViewPage/>
            </Route>
            <Route exact={true} path={mediaEmbedUrl(":entryId")}>
                <EmbedPage/>
            </Route>
            <Route exact={true} path={replyUrl(":projectId")}>
                <ReplyPage/>
            </Route>
            <Route path={"*"}>
                <PageNotFound/>
            </Route>
        </Switch>
    </HashRouter>
);
