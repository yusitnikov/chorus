import React, {useCallback, useRef, useState} from "react";

import "./ResponseRecorder.css";

import {Recorder, RecorderState} from "./Recorder";
import {Player} from "./Player";
import {VideoHolder} from "./VideoHolder";
import {translate} from "../locales/translate";
import {ActionLink} from "./ActionLink";

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
            <div className={"inline-block"}>
                <Player
                    entry={entry}
                    onPlaybackEnded={onPlaybackEnded}
                    ref={playerRef}
                />
            </div>

            <VideoHolder className={"inline-block relative"}>
                <Recorder
                    parentEntryId={entry.id}
                    onStateChanged={handleStateChange}
                    ref={recorderRef}
                />

                {state === RecorderState.done && <div className={"ResponseRecorder__Recorder__Done transparent-overlay input-padding border-radius"}>
                    {translate("Your reply was submitted.")} <ActionLink className={"link"} onClick={() => recorderRef.current?.startRecording()}>{translate("Record one more?")}</ActionLink>
                </div>}
            </VideoHolder>
        </div>
    );
};
