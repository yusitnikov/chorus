import React, {useEffect, useState} from "react";

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
import {CopyToClipboardInput} from "../CopyToClipboardInput";
import {getCurrentLocaleCode} from "../../locales/currentLocale";
import {isRecentlyCreatedProject} from "../../sharedData/recentlyCreatedProjects";
import {SourceRecorderInstructions, SourceRecorderInstructionsCompilationNote} from "../SourceRecorder";
import {Layout} from "../Layout";
import {absoluteUrl, currentPageUrl, replyUrl, viewProjectUrl} from "../../misc/url";

export const ViewPage = () => {
    const {projectId, entryId: entryIdStr} = useParams();

    const [projectLinkCopied, setProjectLinkCopied] = useState(false);
    const [replyLinkCopied, setReplyLinkCopied] = useState(false);

    let redirectTo = null;

    const [source, sourceError, sourceLoaded] = useLoadMediaById(projectId);

    // The first part of the URL is not a projectId by mistake
    const actualProjectId = source && getProjectIdByEntry(source);
    if (actualProjectId && actualProjectId !== projectId) {
        // noinspection PointlessBooleanExpressionJS
        redirectTo = redirectTo || viewProjectUrl(actualProjectId, projectId);
    }

    const isProject = source && isProjectSourceEntry(source);

    const entryId = entryIdStr === "result"
        ? source && getProjectCompilationId(source)
        : (entryIdStr || projectId);

    if (source && !entryId) {
        redirectTo = redirectTo || viewProjectUrl(projectId);
    }

    const entryIdToLoad = (redirectTo || entryId === projectId) ? "" : entryId;
    let [entry, entryError, entryLoaded] = useLoadMediaById(entryIdToLoad);
    if (entryId && !entryIdToLoad) {
        entry = source;
    }

    if (entryError) {
        redirectTo = redirectTo || viewProjectUrl(projectId);
    }

    // The second part of the URL is an entry that doesn't belong to this project
    const actualProjectId2 = entry && getProjectIdByEntry(entry);
    if (actualProjectId2 && actualProjectId2 !== projectId) {
        redirectTo = redirectTo || viewProjectUrl(actualProjectId2, entryIdStr);
    }

    const [projectEntries] = useLoadProjectEntries(source);
    const {compilation, replies = []} = projectEntries || {};

    const isNewProject = isRecentlyCreatedProject(projectId);

    const allLoaded = sourceLoaded && entryLoaded;
    const isError = sourceError || redirectTo;

    const preventClose = allLoaded && !isError && isNewProject && !projectLinkCopied;
    useEffect(() => {
        if (preventClose) {
            window.onbeforeunload = () => "";

            return () => window.onbeforeunload = null;
        }
    }, [preventClose]);

    if (sourceError) {
        return <PageNotFound title={translate("Project not found")}/>;
    }

    if (redirectTo) {
        return <Redirect to={redirectTo}/>;
    }

    if (!allLoaded) {
        return <Layout/>;
    }

    const relatedEntries = [source, ...replies, compilation].filter(entry => entry && entry.id !== entryId);

    const names = getProjectEntryNamesMap(projectId, getProjectCompilationId(source), replies);

    return (
        <Layout
            title={<>
                {source.name}{isProject && ` - ${names[entryId] || translateWithContext("Reply", "noun")}`}

                {isProject && <Link to={replyUrl(projectId)} className={"ViewPage__ReplyLink link"}>
                    {translateWithContext("Reply", "verb")}
                </Link>}
            </>}
        >
            {isNewProject && <SourceRecorderInstructions
                fulfilledSteps={{
                    1: true,
                    2: true,
                    3: projectLinkCopied,
                    4: replyLinkCopied,
                }}
            />}

            {!isNewProject && <SourceRecorderInstructionsCompilationNote/>}

            <div className={"ViewPage__content"}>
                <div className={"inline-block"}>
                    <Player entry={entry}/>
                </div>

                <div className={"inline-block"}>
                    <h2 className={"block"}>
                        {translate("Share")}
                    </h2>

                    <ViewPageLinkShare
                        label={translate("Link to the project:")}
                        url={currentPageUrl()}
                        onCopy={() => setProjectLinkCopied(true)}
                    />

                    <ViewPageLinkShare
                        label={translate("Reply link:")}
                        url={absoluteUrl(replyUrl(projectId))}
                        onCopy={() => setReplyLinkCopied(true)}
                    />

                    {relatedEntries.length !== 0 && <>
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
                    </>}
                </div>
            </div>
        </Layout>
    );
};

const ViewPageLinkShare = ({label, url, onCopy}) => (
    <CopyToClipboardInput
        text={url}
        label={label}
        labelWidth={getCurrentLocaleCode() === "he" ? 110 : 160}
        onCopy={onCopy}
    />
);
