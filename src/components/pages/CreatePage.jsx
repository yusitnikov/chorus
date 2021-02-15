import React from "react";
import {SourceRecorder} from "../SourceRecorder";
import {translate} from "../../locales/translate";

export const CreatePage = () => (
    <>
        <h1 className={"block"}>
            {translate("Create New Project")}
        </h1>

        <SourceRecorder/>
    </>
);
