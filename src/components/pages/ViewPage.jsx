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
import {translate, translatePlural} from "../../locales/translate";
import {useLoadMediaById} from "../../models/Media";

export const ViewPage = () => {
    const {projectId, entryId: entryIdStr} = useParams();

    let redirectTo = null;

    const [source, sourceLoaded] = useLoadMediaById(projectId);

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
    let [entry, entryLoaded] = useLoadMediaById(entryIdToLoad);
    if (entryId && !entryIdToLoad) {
        entry = source;
    }

    // The second part of the URL is an entry that doesn't belong to this project
    const actualProjectId2 = entry && getProjectIdByEntry(entry);
    if (actualProjectId2 && actualProjectId2 !== projectId) {
        redirectTo = redirectTo || `/view/${actualProjectId2}/${entryIdStr}`;
    }

    const [projectEntries, projectEntriesLoaded] = useLoadProjectEntries(source);
    const {compilation, replies = []} = projectEntries || {};

    if (redirectTo) {
        return <Redirect to={redirectTo}/>;
    }

    if (!entryLoaded || !sourceLoaded || !projectEntriesLoaded) {
        return null;
    }

    const relatedEntries = [source, ...replies, compilation].filter(entry => entry && entry.id !== entryId);

    const names = getProjectEntryNamesMap(projectId, compilation?.id, replies);

    return (
        <>
            <h1 className={"block"}>
                {source.name} - {names[entryId]}

                {isProject && <Link to={`/reply/${projectId}`} className={"ViewPage__ReplyLink link"}>
                    {translate("Reply")}
                </Link>}
            </h1>

            <div className={"ViewPage__content"}>
                <div className={"inline-block"}>
                    <Player entry={entry}/>
                </div>

                {isProject && <div className={"inline-block"}>
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
