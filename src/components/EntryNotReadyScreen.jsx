import React from "react";
import {useTranslate} from "../contexts/app";

export const EntryNotReadyScreen = ({thumbnailUrl}) => {
    const translate = useTranslate();

    return (
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
};
