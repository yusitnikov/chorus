import {Player} from "../../src/components/Player";
import {getProjectCompilationId, isProjectSourceEntry} from "../../src/models/Project";
import {loadMediaById} from "../../src/models/Media";
import {PageNotFound} from "../../src/components/errors/PageNotFound";
import {homePageUrl} from "../../src/misc/url";
import {thumbnailUrl} from "../../src/utils/thumbnailUrl";
import {LayoutHead} from "../../src/components/Layout";
import Link from "next/link";
import {createClientWithKs, createKs} from "../../src/misc/kalturaClient";
import {useTranslate} from "../../src/contexts/app";

// noinspection JSUnusedGlobalSymbols
export async function getServerSideProps({params: {entryId}}) {
    try {
        const ks = await createKs(false);
        const client = createClientWithKs(ks);

        const entry = await loadMediaById(client, entryId);
        const isProject = isProjectSourceEntry(entry);
        const compilationId = isProject && getProjectCompilationId(entry);
        const compilation = compilationId && await loadMediaById(client, compilationId);

        return {
            props: {
                ks,
                entry,
                isProject,
                compilationId,
                compilation,
            },
        };
    } catch (error) {
        console.error(`Error at /embed/${entryId}`, error);

        return {
            props: {
                error: true,
            },
        };
    }
}

export default function EntryId({ks, entry, isProject, compilationId, compilation, error}) {
    const translate = useTranslate();

    if (error || isProject && !compilationId) {
        return <PageNotFound title={translate("Video not found")}/>;
    }

    const viewEntry = isProject ? compilation : entry;

    return (
        <>
            <LayoutHead title={entry.name} image={thumbnailUrl(ks, viewEntry)}/>

            <div className={"block input-padding"}>
                <h1 className={"block"}>
                    {entry.name} - <Link href={homePageUrl}><a className={"link"} target={"_blank"}>Chorus</a></Link>
                </h1>

                <Player ks={ks} entry={viewEntry}/>
            </div>
        </>
    );
};
