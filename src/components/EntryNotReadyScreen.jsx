import React from "react";

import {translate} from "../locales/translate";

export const EntryNotReadyScreen = ({thumbnailUrl}) => (
    <>
        <img
            className={"fill"}
            src={thumbnailUrl}
            alt={"Entry thumbnail"}
            title={"Entry thumbnail"}
        />

        <div className={"fill flex flex-hcenter flex-vcenter"}>
            <span className={"transparent-overlay input-padding border-radius"} style={{fontSize: 30}}>
                {translate("Processing the video, please wait...")}
            </span>
        </div>
    </>
);
