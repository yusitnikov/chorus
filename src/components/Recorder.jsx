import React, {forwardRef, useCallback, useEffect, useRef, useState} from "react";
import {fixWebmDuration, Kaltura, ks} from "../misc/externals";
import {VideoHolder} from "./VideoHolder";
import {useEventListener} from "../hooks/useEventListener";
import {useAutoIncrementId} from "../hooks/useAutoIncrementId";
import {usePlayerCreatedListener} from "../hooks/usePlayerCreatedListener";
import {abortablePromise} from "../misc/abortablePromise";
import {updateMedia} from "../models/Media";
import {enums} from "kaltura-client";
import {useObjectState} from "../hooks/useObjectState";
import {phrasesByLocale} from "../locales/phrases";
import {getCurrentLocaleCode} from "../locales/currentLocale";
import {projectAdminTag} from "../models/Project";

export const RecorderState = {
    destroyed: "destroyed",
    ready: "ready",
    countdown: "countdown",
    recording: "recording",
    fixing: "fixing",
    recorded: "recorded",
    uploading: "uploading",
    updating: "updating",
    done: "done",
};

export const Recorder = forwardRef(({
                                        parentEntryId = null,
                                        onStateChanged,
                                        onUploadedEntryIdChanged,
                                    }, recorderRef) => {
    const containerId = "recorder" + useAutoIncrementId();

    const initialState = {
        state: RecorderState.destroyed,
        recordingStartTime: 0,
        entryId: null,
        duration: null,
        blob: null,
    };
    const [
        {
            state,
            setState,
            recordingStartTime,
            entryId,
            duration,
            blob,
        },
        mergeState
    ] = useObjectState(initialState);

    const resetState = useCallback(
        (state = initialState.state) => mergeState({...initialState, state}),
        [mergeState]
    );

    const [recorder, setRecorder] = useState(null);
    const [player, setPlayer] = useState(null);
    const [originalPlayerConfig, setOriginalPlayerConfig] = useState(null);

    const ref = useRef(null);

    useEffect(() => {
        const recorder = Kaltura.ExpressRecorder.create(containerId, {
            serviceUrl: process.env.REACT_APP_SERVICE_URL,
            partnerId: process.env.REACT_APP_PARTNER_ID,
            ks,
            app: "chorus",
            showUploadUI: true,
            translations: phrasesByLocale[getCurrentLocaleCode()] || {},
        });

        // Fix the library bug - it doesn't trigger events when calling recordAgain()
        const originalRecordAgain = recorder.instance.recordAgain.bind(recorder.instance);
        recorder.instance.recordAgain = () => {
            originalRecordAgain();
            recorder.instance.dispatcher.dispatchEvent("recordingStarted");
        };

        window.recorder = recorder;
        setRecorder(recorder);
        resetState(RecorderState.ready);

        if (recorderRef) {
            recorderRef.current = {
                startRecording: () => {
                    recorder.instance.resetApp();
                    recorder.instance.handleStartClick();
                },
                stopRecording: () => recorder.instance.stopRecording(),
            };
        }

        return () => {
            recorder.destroy();
            if (recorderRef) {
                recorderRef.current = null;
            }

            resetState();
            setRecorder(null);
        };
    }, []);

    useEffect(() => {
        console.log("State changed to", state);
        onStateChanged && onStateChanged(state);

        switch (state) {
            case RecorderState.countdown: {
                const timeout = setTimeout(() => {
                    mergeState({
                        recordingStartTime: Date.now(),
                        state: RecorderState.recording,
                    })
                }, 3000);
                return () => clearTimeout(timeout);
            }

            case RecorderState.fixing: {
                const blob = new Blob(recorder.instance.state.recordedBlobs, { type: "video/webm" });

                const fixedBlobPromise = abortablePromise(new Promise(resolve => fixWebmDuration(blob, duration, blob => resolve(blob))));
                fixedBlobPromise.then((blob) => mergeState({
                    blob,
                    state: RecorderState.recorded,
                }));
                return () => fixedBlobPromise.abort();
            }

            case RecorderState.updating: {
                const entryUpdatePromise = abortablePromise(updateMedia(entryId, {
                    displayInSearch: enums.EntryDisplayInSearchType.SYSTEM,
                    parentEntryId,
                    adminTags: `expressrecorder,${projectAdminTag}`,
                }));
                entryUpdatePromise.then((result) => {
                    console.log("Updated the entry", result);

                    setState(RecorderState.done);
                });
                return () => entryUpdatePromise.abort();
            }
        }
    }, [state]);

    useEffect(() => {
        entryId && console.log("Uploaded", entryId);
        onUploadedEntryIdChanged && onUploadedEntryIdChanged(entryId);
    }, [entryId]);

    useEventListener(recorder?.instance, "recordingStarted", () => {
        resetState(RecorderState.countdown);
    });

    useEventListener(recorder?.instance, "recordingEnded", () => {
        mergeState({
            duration: Date.now() - recordingStartTime,
            state: RecorderState.fixing,
        });
    });

    useEventListener(recorder?.instance, "recordingCancelled", () => {
        resetState(RecorderState.ready);
    });

    useEventListener(recorder?.instance, "mediaUploadStarted", () => {
        setState(RecorderState.uploading);
    });

    useEventListener(recorder?.instance, "mediaUploadEnded", async({detail: {entryId}}) => {
        mergeState({
            entryId,
            state: RecorderState.updating,
        });
    });

    useEventListener(recorder?.instance, "mediaUploadCancelled", () => {
        resetState(RecorderState.ready);
    });

    usePlayerCreatedListener(player => {
        if (!ref.current?.contains(player.getView())) {
            return;
        }

        player.originalSetMedia = player.setMedia;
        player.setMedia = (originalPlayerConfig) => setOriginalPlayerConfig(originalPlayerConfig);
        setPlayer(player);
    });

    useEffect(() => {
        if (player && originalPlayerConfig && blob) {
            originalPlayerConfig.sources.progressive[0].url = URL.createObjectURL(blob);
            player.originalSetMedia(originalPlayerConfig);
        }
    }, [player, originalPlayerConfig, blob]);

    return (
        <VideoHolder className={"inline-block relative"}>
            <div id={containerId} className={"fill ltr"} ref={ref}/>
        </VideoHolder>
    );
});
