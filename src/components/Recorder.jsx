import React, {forwardRef, useCallback, useEffect, useRef, useState} from "react";

import styles from "./Recorder.module.css";

import {defaultPlayerWidth, VideoHolder} from "./VideoHolder";
import {useEventListener} from "../hooks/useEventListener";
import {usePlayerCreatedListener} from "../hooks/usePlayerCreatedListener";
import {abortablePromise} from "../misc/abortablePromise";
import {updateMediaClientSide} from "../models/Media";
import {enums} from "kaltura-client";
import {useObjectState} from "../hooks/useObjectState";
import {phrasesByLocale} from "../locales/phrases";
import {projectAdminTag} from "../models/Project";
import {ActionLink} from "./ActionLink";
import {useScopedPromise} from "../hooks/useScopedPromise";
import {useIsHead, useLocaleCode, useTranslate} from "../contexts/app";
import fixWebmDuration from "fix-webm-duration";

export const RecorderState = {
    destroyed: "destroyed",
    ready: "ready",
    countdown: "countdown",
    recording: "recording",
    fixing: "fixing",
    recorded: "recorded",
    uploading: "uploading",
    updating: "updating",
    updateError: "updateError",
    done: "done",
};

export const Recorder = forwardRef(({
                                        ks,
                                        parentEntryId = null,
                                        onStateChanged,
                                        onUploadedEntryIdChanged,
                                        width = defaultPlayerWidth,
                                        children,
                                    }, recorderRef) => {
    const isHead = useIsHead();

    const containerId = "recorder";

    const translate = useTranslate();
    const localeCode = useLocaleCode();

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

    const [isReady, setIsReady] = useState(false);
    const [, setPermissionsPromise] = useScopedPromise();
    useEffect(() => {
        if (window?.navigator?.permissions?.query) {
            const permissionsPromise = abortablePromise(Promise.all([
                window.navigator.permissions.query({name: "camera"}),
                window.navigator.permissions.query({name: "microphone"}),
            ]));

            setPermissionsPromise(permissionsPromise);

            permissionsPromise.then(([cameraResult, microphoneResult]) => {
                if (cameraResult.state === "granted" && microphoneResult.state === "granted") {
                    setIsReady(true);
                }
            });
        }
    }, []);

    const ref = useRef(null);

    useEffect(() => {
        if (!isReady || isHead) {
            return;
        }

        const recorder = window.Kaltura.ExpressRecorder.create(containerId, {
            serviceUrl: process.env.NEXT_PUBLIC_SERVICE_URL,
            partnerId: process.env.NEXT_PUBLIC_PARTNER_ID,
            ks,
            app: "chorus",
            showUploadUI: true,
            translations: phrasesByLocale[localeCode] || {},
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
    }, [isReady, isHead]);

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
                fixedBlobPromise
                    .then((blob) => mergeState({
                        blob,
                        state: RecorderState.recorded,
                    }))
                    .catch((error) => {
                        console.error("Failed to fix recorded video duration", error);
                        // Use the unfixed blob here as a fallback
                        mergeState({
                            blob,
                            state: RecorderState.recorded,
                        });
                    });
                return () => fixedBlobPromise.abort();
            }

            case RecorderState.updating: {
                const entryUpdatePromise = abortablePromise(updateMediaClientSide(entryId, {
                    displayInSearch: enums.EntryDisplayInSearchType.SYSTEM,
                    parentEntryId,
                    adminTags: `expressrecorder,${projectAdminTag}`,
                }));
                entryUpdatePromise
                    .then(() => setState(RecorderState.done))
                    .catch((error) => {
                        console.error("Failed to update the entry", error);
                        setState(RecorderState.updateError);
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
        <div className={`${styles.component} ltr`}>
            <VideoHolder width={width}>
                {!isReady && <div className={"fill flex flex-hcenter flex-vcenter gray-borders border-radius"}>
                    <button
                        type={"button"}
                        className={"input-padding"}
                        onClick={() => setIsReady(true)}
                    >
                        {translate("Start")}
                    </button>
                </div>}

                {isReady && <>
                    <div id={containerId} className={"fill"} ref={ref}/>

                    <div className={`${styles.children} absolute`}>
                        {state === RecorderState.updateError && <div className={"block transparent-overlay input-padding border-radius"}>
                            {translate("Failed to save the video.")} <ActionLink className={"link"} onClick={() => setState(RecorderState.updating)}>{translate("Retry")}</ActionLink>
                        </div>}

                        {children}
                    </div>
                </>}
            </VideoHolder>
        </div>
    );
});
