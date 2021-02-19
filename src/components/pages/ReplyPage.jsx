import React from "react";
import {Link, Redirect, useParams} from "react-router-dom";
import {ResponseRecorder} from "../ResponseRecorder";
import {useLoadMediaById} from "../../models/Media";
import {translate} from "../../locales/translate";
import {PageNotFound} from "../errors/PageNotFound";
import {Layout} from "../Layout";
import {replyUrl, viewProjectUrl} from "../../misc/url";
import {thumbnailUrl} from "../../utils/thumbnailUrl";
import {getProjectIdByEntry} from "../../models/Project";

export const ReplyPage = () => {
    const {projectId} = useParams();

    const [source, sourceError] = useLoadMediaById(projectId);

    if (sourceError) {
        return <PageNotFound title={translate("Project not found")}/>;
    }

    if (!source) {
        return <Layout/>;
    }

    const actualProjectId = source && getProjectIdByEntry(source);
    if (actualProjectId && actualProjectId !== projectId) {
        return <Redirect to={replyUrl(actualProjectId)}/>;
    }

    return (
        <Layout
            plainTitle={`${translate("Reply to ")}${source.name}`}
            title={<>
                {translate("Reply to ")}
                <Link to={viewProjectUrl(projectId)} className={"link"}>{source.name}</Link>
            </>}
            image={thumbnailUrl(source)}
        >
            <ResponseRecorder entry={source}/>
        </Layout>
    );
};
