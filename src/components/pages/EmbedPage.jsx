import React from "react";

import {useParams} from "react-router-dom";
import {Player} from "../Player";
import {getProjectCompilationId, isProjectSourceEntry} from "../../models/Project";
import {translate} from "../../locales/translate";
import {useLoadMediaById} from "../../models/Media";
import {PageNotFound} from "../errors/PageNotFound";

export const EmbedPage = () => {
    const {entryId} = useParams();

    const [entry, entryError, entryLoaded] = useLoadMediaById(entryId);
    const isProject = entry && isProjectSourceEntry(entry);
    const compilationId = isProject && getProjectCompilationId(entry);
    const [compilation, compilationError, compilationLoaded] = useLoadMediaById(compilationId);

    if (entryError || compilationError || isProject && !compilationId) {
        return <PageNotFound title={translate("Video not found")}/>;
    }

    if (!entryLoaded || !compilationLoaded) {
        return null;
    }

    return (
        <>
            <h1 className={"block"}>
                {entry.name}
            </h1>

            <Player entry={isProject ? compilation : entry}/>
        </>
    );
};
