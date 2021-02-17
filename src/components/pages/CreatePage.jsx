import React from "react";
import {SourceRecorder} from "../SourceRecorder";
import {translate} from "../../locales/translate";
import {Layout} from "../Layout";

export const CreatePage = () => (
    <Layout title={translate("Create New Project")}>
        <SourceRecorder/>
    </Layout>
);
