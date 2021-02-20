import React from "react";

import styles from "./LanguageSelectionScreen.module.css";
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

            <div className={styles.attribution}>
                Icons made by <a href="https://www.freepik.com" target={"_blank"} title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" target={"_blank"} title="Flaticon">www.flaticon.com</a>
            </div>
        </>
    );
};

const LanguageSelectionScreenItem = ({code, name, onClick}) => {
    return (
        <ActionLink className={styles.item} onClick={() => onClick(code)}>
            <div className={"block"}>
                <Flag
                    code={code}
                    name={name}
                    size={100}
                    className={styles.itemFlag}
                />
            </div>

            <div className={styles.itemText}>
                {name}
            </div>
        </ActionLink>
    );
};
