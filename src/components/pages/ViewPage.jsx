import React, {useEffect, useState} from "react";

import "./ViewPage.css";

import {Link, Redirect, useParams} from "react-router-dom";
import {Player} from "../Player";
import {MediaList, MediaListItem} from "../MediaList";
import {
    getProjectCompilationId, getProjectEntryNamesMap,
    getProjectIdByEntry, isProjectSourceEntry,
    useLoadProjectReplies
} from "../../models/Project";
import {translate, translatePlural, translateWithContext} from "../../locales/translate";
import {useLoadMediaById} from "../../models/Media";
import {PageNotFound} from "../errors/PageNotFound";
import {CopyToClipboardInput} from "../CopyToClipboardInput";
import {getCurrentLocaleCode} from "../../locales/currentLocale";
import {isRecentlyCreatedProject} from "../../sharedData/recentlyCreatedProjects";
import {SourceRecorderInstructions, SourceRecorderInstructionsCompilationNote} from "../SourceRecorder";
import {Layout} from "../Layout";
import {absoluteUrl, currentPageUrl, mediaEmbedUrl, replyUrl, viewProjectUrl} from "../../misc/url";

export const ViewPage = () => {
    let {projectId, entryId} = useParams();
    entryId = entryId || projectId;

    // region All hooks are here
    const [projectLinkCopied, setProjectLinkCopied] = useState(false);
    const [replyLinkCopied, setReplyLinkCopied] = useState(false);

    const [source, sourceError, sourceLoaded] = useLoadMediaById(projectId);

    const compilationId = source && getProjectCompilationId(source);
    const [compilation] = useLoadMediaById(compilationId);

    const entryIdToLoad = entryId === projectId ? "" : entryId;
    let [entry, entryError, entryLoaded] = useLoadMediaById(entryIdToLoad);
    if (entryId === projectId) {
        entry = source;
    }

    const [replies = []] = useLoadProjectReplies(source);

    const isNewProject = isRecentlyCreatedProject(projectId);

    const preventClose = isNewProject && !projectLinkCopied;
    useEffect(() => {
        if (preventClose) {
            window.onbeforeunload = () => "";

            return () => window.onbeforeunload = null;
        }
    }, [preventClose]);
    // endregion

    // The first part of the URL is not a projectId by mistake
    const actualProjectId = source && getProjectIdByEntry(source);
    if (actualProjectId && actualProjectId !== projectId) {
        return <Redirect to={viewProjectUrl(actualProjectId, projectId)}/>;
    }

    const isProject = source && isProjectSourceEntry(source);

    if (source && !entryId) {
        return <Redirect to={viewProjectUrl(projectId)}/>;
    }

    if (entryError) {
        return <Redirect to={viewProjectUrl(projectId)}/>;
    }

    // The second part of the URL is an entry that doesn't belong to this project
    const actualProjectId2 = entry && getProjectIdByEntry(entry);
    if (actualProjectId2 && actualProjectId2 !== projectId) {
        return <Redirect to={viewProjectUrl(actualProjectId2, entryId)}/>;
    }

    if (sourceError) {
        return <PageNotFound title={translate("Project not found")}/>;
    }

    if (!sourceLoaded || !entryLoaded) {
        return <Layout/>;
    }

    const relatedEntries = [source, ...replies].filter(entry => entry && entry.id !== entryId);

    const names = getProjectEntryNamesMap(projectId, compilationId, replies);

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
                                items={relatedEntries}
                                nameCallback={item => names[item.id]}
                            />
                        </div>
                    </>}

                    {compilation && <>
                        <h2 className={"block"}>
                            {translate("Compilation")}
                        </h2>

                        <div className={"block"}>
                            <MediaListItem
                                projectId={projectId}
                                entry={compilation}
                                url={mediaEmbedUrl(projectId)}
                                openInNewPage={true}
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
