import React from "react";

import {Link, useParams} from "react-router-dom";
import {Player} from "../Player";
import {getProjectCompilationId, isProjectSourceEntry} from "../../models/Project";
import {translate} from "../../locales/translate";
import {useLoadMediaById} from "../../models/Media";
import {PageNotFound} from "../errors/PageNotFound";
import {usePageInfo} from "../../hooks/usePageInfo";
import {homePageUrl} from "../../misc/url";
import {thumbnailUrl} from "../../utils/thumbnailUrl";

export const EmbedPage = () => {
    const {entryId} = useParams();

    const [entry, entryError, entryLoaded] = useLoadMediaById(entryId);
    const isProject = entry && isProjectSourceEntry(entry);
    const compilationId = isProject && getProjectCompilationId(entry);
    const [compilation, compilationError, compilationLoaded] = useLoadMediaById(compilationId);

    usePageInfo(entry?.name, entry && thumbnailUrl(entry));

    if (entryError || compilationError || isProject && !compilationId) {
        return <PageNotFound title={translate("Video not found")}/>;
    }

    if (!entryLoaded || !compilationLoaded) {
        return null;
    }

    return (
        <div className={"block input-padding"}>
            <h1 className={"block"}>
                {entry.name} - <Link className={"link"} to={homePageUrl} target={"_blank"}>Chorus</Link>
            </h1>

            <Player entry={isProject ? compilation : entry}/>
        </div>
    );
};
