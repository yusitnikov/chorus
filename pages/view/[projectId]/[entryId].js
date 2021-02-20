import {useEffect, useState} from "react";

import styles from "./view.module.css";

import {Player} from "../../../src/components/Player";
import {MediaList, MediaListItem} from "../../../src/components/MediaList";
import {
    getProjectCompilationId,
    getProjectIdByEntry,
    isProjectSourceEntry,
    useProjectEntryNamesMap
} from "../../../src/models/Project";
import {PageNotFound} from "../../../src/components/errors/PageNotFound";
import {CopyToClipboardInput} from "../../../src/components/CopyToClipboardInput";
import {SourceRecorderInstructions, SourceRecorderInstructionsCompilationNote} from "../../../src/components/SourceRecorder";
import {Layout} from "../../../src/components/Layout";
import {mediaEmbedUrl, replyUrl, viewProjectUrl} from "../../../src/misc/url";
import {InlineBlocksHolder} from "../../../src/components/InlineBlocksHolder";
import {thumbnailUrl} from "../../../src/utils/thumbnailUrl";
import {loadMediaById} from "../../../src/models/Media";
import {loadProjectReplies} from "../../../src/models/Project";
import Link from "next/link";
import {createClientWithKs, createKs} from "../../../src/misc/kalturaClient";
import {useLocaleCode, useTranslate, useTranslatePlural, useTranslateWithContext} from "../../../src/contexts/app";
import {useRedirect} from "../../../src/hooks/useRedirect";
import {useIsRecentlyCreatedProject} from "../../../src/contexts/recentlyCreatedProjects";

// noinspection JSUnusedGlobalSymbols
export async function getServerSideProps({params: {projectId, entryId = projectId}}) {
    try {
        const ks = await createKs(false);
        const client = createClientWithKs(ks);

        const source = await loadMediaById(client, projectId);

        // The first part of the URL is not a projectId by mistake
        const actualProjectId = source && getProjectIdByEntry(source);
        if (actualProjectId && actualProjectId !== projectId) {
            return {
                props: {
                    projectId,
                    entryId,
                    redirectUrl: viewProjectUrl(actualProjectId, projectId),
                },
            };
        }

        if (!isProjectSourceEntry(source)) {
            return {
                props: {
                    projectId,
                    entryId,
                    redirectUrl: mediaEmbedUrl(projectId),
                },
            };
        }

        const compilationId = getProjectCompilationId(source);
        let compilation = null;
        try {
            compilation = compilationId && await loadMediaById(client, compilationId);
        } catch (error) {
            console.error(`Error at /view/${projectId}/${entryId} while loading ${compilationId}:`, error);
        }

        let entry;
        try {
            entry = entryId === projectId ? source : await loadMediaById(client, entryId);
        } catch (error) {
            console.error(`Error at /view/${projectId}/${entryId} while loading ${entryId}:`, error);

            return {
                props: {
                    projectId,
                    entryId,
                    redirectUrl: viewProjectUrl(projectId),
                },
            };
        }

        // The second part of the URL is an entry that doesn't belong to this project
        const actualProjectId2 = getProjectIdByEntry(entry);
        if (actualProjectId2 && actualProjectId2 !== projectId) {
            return {
                props: {
                    projectId,
                    entryId,
                    redirectUrl: viewProjectUrl(actualProjectId2, entryId),
                },
            };
        }

        const replies = await loadProjectReplies(client, source);

        return {
            props: {
                projectId,
                entryId,
                ks,
                source,
                entry,
                compilationId,
                compilation,
                replies,
            },
        };
    } catch (error) {
        console.error(`Error at /view/${projectId}/${entryId}:`, error);

        return {
            props: {
                projectId,
                entryId,
                error: true,
            },
        };
    }
}

export default function ViewProjectIdEntryId({projectId, entryId, ks, source, entry, compilationId, compilation, replies, redirectUrl, error}) {
    // region All hooks are here
    const translate = useTranslate();
    const translateWithContext = useTranslateWithContext();
    const translatePlural = useTranslatePlural();
    const isRecentlyCreatedProject = useIsRecentlyCreatedProject();

    const [projectLinkCopied, setProjectLinkCopied] = useState(false);
    const [replyLinkCopied, setReplyLinkCopied] = useState(false);

    const isNewProject = isRecentlyCreatedProject(projectId);

    const preventClose = isNewProject && !projectLinkCopied;
    useEffect(() => {
        if (preventClose) {
            window.onbeforeunload = () => "";

            return () => window.onbeforeunload = null;
        }
    }, [preventClose]);

    useRedirect(redirectUrl);
    // endregion

    if (redirectUrl) {
        return null;
    }

    if (error) {
        return <PageNotFound title={translate("Project not found")}/>;
    }

    const relatedEntries = [source, ...replies].filter(entry => entry && entry.id !== entryId);

    const names = useProjectEntryNamesMap(projectId, compilationId, replies);

    const pageTitle = `${source.name} - ${names[entryId] || translateWithContext("Reply", "noun")}`;

    return (
        <Layout
            plainTitle={pageTitle}
            title={<>
                {pageTitle}

                <Link href={replyUrl(projectId)}>
                    <a className={`${styles.replyLink} link`}>
                        {translateWithContext("Reply", "verb")}
                    </a>
                </Link>

                <div className={"clear-both"}/>
            </>}
            image={thumbnailUrl(ks, entry)}
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

            {/* Warning: the InlineBlocksHolder element can't be combined with styles.content, because the latter is a flex. */}
            <InlineBlocksHolder>
                <div className={styles.content}>
                    <div className={"inline-block mobile-only-block"}>
                        <Player ks={ks} entry={entry}/>
                    </div>

                    <div className={"inline-block mobile-only-block"}>
                        <h2 className={"block"}>
                            {translate("Share")}
                        </h2>

                        <ViewPageLinkShare
                            label={translate("Link to the project:")}
                            url={process.env.NEXT_PUBLIC_ORIGIN + viewProjectUrl(projectId)}
                            onCopy={() => setProjectLinkCopied(true)}
                        />

                        <ViewPageLinkShare
                            label={translate("Reply link:")}
                            url={process.env.NEXT_PUBLIC_ORIGIN + replyUrl(projectId)}
                            onCopy={() => setReplyLinkCopied(true)}
                        />

                        {compilationId && <ViewPageLinkShare
                            label={translate("Result link:")}
                            url={process.env.NEXT_PUBLIC_ORIGIN + mediaEmbedUrl(projectId)}
                        />}

                        <h2 className={"block"}>
                            {translatePlural(relatedEntries.length, "%u reply", "%u replies")}
                        </h2>

                        {relatedEntries.length !== 0 && <>
                            <div className={"block"}>
                                <MediaList
                                    ks={ks}
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

                            <InlineBlocksHolder className={"block"}>
                                <MediaListItem
                                    ks={ks}
                                    projectId={projectId}
                                    entry={compilation}
                                    url={mediaEmbedUrl(projectId)}
                                    openInNewPage={true}
                                />
                            </InlineBlocksHolder>
                        </>}
                    </div>
                </div>
            </InlineBlocksHolder>
        </Layout>
    );
};

const ViewPageLinkShare = ({label, url, onCopy}) => {
    const localeCode = useLocaleCode();

    return (
        <CopyToClipboardInput
            text={url}
            label={label}
            labelWidth={localeCode === "he" ? 110 : 160}
            inputWidth={250}
            onCopy={onCopy}
        />
    );
};
