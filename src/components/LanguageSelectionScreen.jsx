import React from "react";

import "./LanguageSelectionScreen.css";
import {allLocales} from "../locales/allLocales";
import {ActionLink} from "./ActionLink";
import {Flag} from "./Flag";

export const LanguageSelectionScreen = ({onLanguageSelected}) => {
    return (
        <>
            <div className={"fill flex flex-hcenter flex-vcenter"}>
                <div style={{textAlign: "center"}}>
                    {allLocales.map(({code, name}) => (
                        <LanguageSelectionScreenItem key={code} code={code} name={name} onClick={onLanguageSelected}/>
                    ))}
                </div>
            </div>

            <div className={"LanguageSelectionScreen__Attribution"}>
                Icons made by <a href="https://www.freepik.com" target={"_blank"} title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" target={"_blank"} title="Flaticon">www.flaticon.com</a>
            </div>
        </>
    );
};

const LanguageSelectionScreenItem = ({code, name, onClick}) => {
    return (
        <ActionLink className={"LanguageSelectionScreenItem"} onClick={() => onClick(code)}>
            <Flag
                code={code}
                name={name}
                size={100}
                className={"block"}
            />

            <div className={"LanguageSelectionScreenItem__Text"}>
                {name}
            </div>
        </ActionLink>
    );
};
