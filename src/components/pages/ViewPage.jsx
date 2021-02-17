import React from "react";

import "./ViewPage.css";

import {Link, Redirect, useParams} from "react-router-dom";
import {Player} from "../Player";
import {MediaList} from "../MediaList";
import {
    getProjectCompilationId, getProjectEntryNamesMap,
    getProjectIdByEntry, isProjectSourceEntry,
    useLoadProjectEntries
} from "../../models/Project";
import {translate, translatePlural, translateWithContext} from "../../locales/translate";
import {useLoadMediaById} from "../../models/Media";
import {PageNotFound} from "../errors/PageNotFound";

export const ViewPage = () => {
    const {projectId, entryId: entryIdStr} = useParams();

    let redirectTo = null;

    const [source, sourceError, sourceLoaded] = useLoadMediaById(projectId);

    // The first part of the URL is not a projectId by mistake
    const actualProjectId = source && getProjectIdByEntry(source);
    if (actualProjectId && actualProjectId !== projectId) {
        // noinspection PointlessBooleanExpressionJS
        redirectTo = redirectTo || `/view/${actualProjectId}/${projectId}`;
    }

    const isProject = source && isProjectSourceEntry(source);

    const entryId = entryIdStr === "result"
        ? source && getProjectCompilationId(source)
        : (entryIdStr || projectId);

    if (source && !entryId) {
        redirectTo = redirectTo || `/view/${projectId}`;
    }

    const entryIdToLoad = (redirectTo || entryId === projectId) ? "" : entryId;
    let [entry, entryError, entryLoaded] = useLoadMediaById(entryIdToLoad);
    if (entryId && !entryIdToLoad) {
        entry = source;
    }

    if (entryError) {
        redirectTo = redirectTo || `/view/${projectId}`;
    }

    // The second part of the URL is an entry that doesn't belong to this project
    const actualProjectId2 = entry && getProjectIdByEntry(entry);
    if (actualProjectId2 && actualProjectId2 !== projectId) {
        redirectTo = redirectTo || `/view/${actualProjectId2}/${entryIdStr}`;
    }

    const [projectEntries, projectEntriesError, projectEntriesLoaded] = useLoadProjectEntries(source);
    const {compilation, replies = []} = projectEntries || {};

    if (sourceError) {
        return <PageNotFound title={translate("Project not found")}/>;
    }

    if (redirectTo) {
        return <Redirect to={redirectTo}/>;
    }

    if (!entryLoaded || !sourceLoaded) {
        return null;
    }

    const relatedEntries = [source, ...replies, compilation].filter(entry => entry && entry.id !== entryId);

    const names = getProjectEntryNamesMap(projectId, getProjectCompilationId(source), replies);

    return (
        <>
            <h1 className={"block"}>
                {source.name} - {names[entryId] || translateWithContext("Reply", "noun")}

                {isProject && <Link to={`/reply/${projectId}`} className={"ViewPage__ReplyLink link"}>
                    {translateWithContext("Reply", "verb")}
                </Link>}
            </h1>

            <div className={"ViewPage__content"}>
                <div className={"inline-block"}>
                    <Player entry={entry}/>
                </div>

                {isProject && projectEntriesLoaded && !projectEntriesError && <div className={"inline-block"}>
                    <h2 className={"block"}>
                        {translatePlural(relatedEntries.length, "%u related video", "%u related videos")}
                    </h2>

                    <div className={"block"}>
                        <MediaList
                            projectId={projectId}
                            compilationId={compilation?.id}
                            items={relatedEntries}
                            customNameCallback={item => names[item.id]}
                        />
                    </div>
                </div>}
            </div>
        </>
    );
};
