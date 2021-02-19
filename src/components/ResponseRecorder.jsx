import React, {useCallback, useRef, useState} from "react";

import "./ResponseRecorder.css";

import {Recorder, RecorderState} from "./Recorder";
import {Player} from "./Player";
import {translate} from "../locales/translate";
import {ActionLink} from "./ActionLink";
import {
    SourceRecorderInstructionsPreRecordCheckList,
    SourceRecorderInstructionsRecordCheckList
} from "./SourceRecorder";
import {Link} from "react-router-dom";
import {homePageUrl, viewProjectUrl} from "../misc/url";
import {InlineBlocksHolder} from "./InlineBlocksHolder";

export const ResponseRecorder = ({entry}) => {
    const playerRef = useRef(null);

    const recorderRef = useRef(null);

    const onPlaybackEnded = useCallback(() => {
        recorderRef.current?.stopRecording();
    }, []);

    const [state, setState] = useState(RecorderState.destroyed);
    const handleStateChange = (state) => {
        setState(state);

        switch (state) {
            case "countdown":
                playerRef.current?.stop();
                break;
            case "recording":
                playerRef.current?.play();
                break;
        }
    };

    return (
        <div>
            <div className={"block"}>
                {translate("If you got to this page, you were asked by your friend or colleague to join their Chorus project: they recorded a song that you can see in the player below, and ask you to record yourself singing it together with them.")}&nbsp;
                <Link className={"link"} to={homePageUrl} target={"_blank"}>{translate("Learn more about the Chorus service")}</Link>
            </div>

            <div className={"block"}>
                {translate("Recordings of all project participants will be automatically compiled into 1 video of everyone singing together.")}&nbsp;
                <Link className={"link"} to={viewProjectUrl(entry.id)}>{translate("See other replies")}</Link>
            </div>

            <div className={"block"}>
                {translate("Use the recorder below - hit the red button to start.")} {translate("Some useful tips:")}
                <ul>
                    <SourceRecorderInstructionsPreRecordCheckList/>
                    <li>{translate("Listen to the original recording once. Try singing along until you see that you can start on time and sing along without major hitches.")}</li>
                    <li>{translate("Don't strive for absolute perfection. If you are not preparing a song for an international competition, minor flaws are ok.")}</li>
                    <li>{translate("Use a headset or earphones to make sure that the source video won't be recorded again through your mic. One earphone is a perfect choice.")}</li>
                    <SourceRecorderInstructionsRecordCheckList/>
                </ul>
            </div>

            <InlineBlocksHolder className={"block"}>
                <div className={"inline-block mobile-only-block border-radius"}>
                    <Player
                        entry={entry}
                        onPlaybackEnded={onPlaybackEnded}
                        ref={playerRef}
                    />
                </div>

                <div className={"inline-block mobile-only-block"}>
                    <Recorder
                        parentEntryId={entry.id}
                        onStateChanged={handleStateChange}
                        ref={recorderRef}
                    >
                        {state === RecorderState.done && <div className={"ResponseRecorder__Recorder__Done transparent-overlay inline-block input-padding border-radius"}>
                            {translate("Your reply was submitted.")}<br/>
                            <ActionLink className={"link"} onClick={() => recorderRef.current?.startRecording()}>{translate("Record one more?")}</ActionLink>
                        </div>}
                    </Recorder>
                </div>
            </InlineBlocksHolder>
        </div>
    );
};
