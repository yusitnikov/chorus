import {ResponseRecorder} from "../../src/components/ResponseRecorder";
import {loadMediaById} from "../../src/models/Media";
import {PageNotFound} from "../../src/components/errors/PageNotFound";
import {Layout} from "../../src/components/Layout";
import {replyUrl, viewProjectUrl} from "../../src/misc/url";
import {thumbnailUrl} from "../../src/utils/thumbnailUrl";
import {getProjectIdByEntry} from "../../src/models/Project";
import Link from "next/link";
import {createClientWithKs, createKs} from "../../src/misc/kalturaClient";
import {useTranslate} from "../../src/contexts/app";
import {useRedirect} from "../../src/hooks/useRedirect";

// noinspection JSUnusedGlobalSymbols
export async function getServerSideProps({params: {projectId}}) {
    try {
        const ks = await createKs(false);
        const client = createClientWithKs(ks);

        const source = await loadMediaById(client, projectId);

        return {
            props: {
                projectId,
                ks,
                source,
            },
        };
    } catch (error) {
        console.error(`Error at /reply/${projectId}:`, error);

        return {
            props: {
                projectId,
                error: true,
            },
        };
    }
}

export default function Reply({projectId, ks, source, error}) {
    const translate = useTranslate();

    const actualProjectId = !error && getProjectIdByEntry(source);
    const redirectUrl = actualProjectId && actualProjectId !== projectId && replyUrl(actualProjectId);
    useRedirect(redirectUrl);
    if (redirectUrl) {
        return null;
    }

    if (error) {
        return <PageNotFound title={translate("Project not found")}/>;
    }

    return (
        <Layout
            plainTitle={`${translate("Reply to ")}${source.name}`}
            title={<>
                {translate("Reply to ")}
                <Link href={viewProjectUrl(projectId)}><a className={"link"}>{source.name}</a></Link>
            </>}
            image={thumbnailUrl(ks, source)}
        >
            <ResponseRecorder ks={ks} entry={source}/>
        </Layout>
    );
};
