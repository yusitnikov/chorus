import React from "react";
import {Link, Redirect, useParams} from "react-router-dom";
import {ResponseRecorder} from "../ResponseRecorder";
import {useLoadMediaById} from "../../models/Media";
import {translate} from "../../locales/translate";
import {PageNotFound} from "../errors/PageNotFound";
import {Layout} from "../Layout";

export const ReplyPage = () => {
    const {projectId} = useParams();

    const [source, sourceError] = useLoadMediaById(projectId);

    if (sourceError) {
        return <PageNotFound title={translate("Project not found")}/>;
    }

    if (!source) {
        return <Layout/>;
    }

    if (source.parentEntryId) {
        return <Redirect to={`/reply/${source.parentEntryId}`}/>;
    }

    return (
        <Layout
            title={<>
                {translate("Reply to ")}
                <Link to={`/view/${projectId}`} className={"link"}>{source.name}</Link>
            </>}
        >
            <ResponseRecorder entry={source}/>
        </Layout>
    );
};
