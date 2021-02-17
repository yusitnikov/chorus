import React, {useState} from "react";
import {Recorder, RecorderState} from "./Recorder";
import {Redirect} from "react-router-dom";
import {translate} from "../locales/translate";
import {updateMedia} from "../models/Media";
import {WithLabel} from "./WithLabel";
import {Error} from "./errors/Error";
import {addRecentlyCreatedProject} from "../sharedData/recentlyCreatedProjects";

export const SourceRecorder = () => {
    const [state, setState] = useState(null);
    const [entryId, setEntryId] = useState(null);
    const [formSubmitted, setFormSubmitted] = useState(false);

    if (entryId && formSubmitted) {
        addRecentlyCreatedProject(entryId);

        return <Redirect to={`/view/${entryId}`}/>;
    }

    const doneRecording = entryId && state === RecorderState.done;

    return (
        <>
            <h3 className={"block"}>
                {translate("Let's start!")}
            </h3>

            <SourceRecorderInstructions fulfilledSteps={{1: entryId}}/>

            {!doneRecording && <Recorder onStateChanged={setState} onUploadedEntryIdChanged={setEntryId}/>}

            {doneRecording && <SourceRecorderForm entryId={entryId} onSubmit={() => setFormSubmitted(true)}/>}
        </>
    );
};

export const SourceRecorderInstructions = ({fulfilledSteps = {}}) => {
    const [expanded, setExpanded] = useState(true);

    return (
        <details className={"block"} open={expanded} onToggle={event => setExpanded(event.target.open)}>
            <summary className={"block-margin"}>
                {fulfilledSteps[1] ? translate("Great, just a little bit left:") : translate("That's how you do it:")}&nbsp;
                <span className={"link"}>({translate(expanded ? "shrink" : "expand")})</span>
            </summary>

            <SourceRecorderInstructionsStep step={1} done={fulfilledSteps[1]}>
                {translate("Record your part of the song. Use the recorder below - hit the red button to start.")} {translate("Some useful tips:")}
                <ul>
                    <li>{translate("Check the camera/audio settings before you start.")}</li>
                    <li>{translate("Don't start singing immediately. Start with a sign of when you're going to start singing instead (e.g. \"two, one, (start singing)\"). It will be easier for your co-recorders to join in time this way.")}</li>
                    <li>{translate("You can even start with a speech to your co-recorders: explain what's your project, how to reply, give some useful tips. You will always be able to cut it later. Just make sure to keep it short: remember, the co-recorders will not be able to skip it while recording their replies.")}</li>
                    <li>{translate("Sing clear. If you're full of initiatives but can't sing clear - no problem, just ask your friend to help :)")}</li>
                    <li>{translate("Sing loud.")}</li>
                    <li>{translate("Listen to the recording before uploading it, check that everything's all right.")}</li>
                </ul>
            </SourceRecorderInstructionsStep>

            <SourceRecorderInstructionsStep step={2} done={fulfilledSteps[2]}>
                {translate("Give a name to your project and submit the form. You will be redirected to the project home page.")}
            </SourceRecorderInstructionsStep>

            <SourceRecorderInstructionsStep step={3} done={fulfilledSteps[3]}>
                <strong style={{color: "red"}}>{translate("Important!")}</strong> {translate("Save the link to your project. There's no page with the list of recently created projects, so you will be able to access the project only by the direct link.")}
            </SourceRecorderInstructionsStep>

            <SourceRecorderInstructionsStep step={4} done={fulfilledSteps[4]}>
                <div className={"block"}>
                    {translate("Share the reply link with people that you want to record replies to your video.")}
                </div>

                <SourceRecorderInstructionsCompilationNote/>
            </SourceRecorderInstructionsStep>

            <SourceRecorderInstructionsStep step={5} done={fulfilledSteps[5]}>
                {translate("After gathering all replies and waiting for the result video to compile, share the link to the compilation video to the prospect :)")}
            </SourceRecorderInstructionsStep>
        </details>
    );
}

export const SourceRecorderInstructionsCompilationNote = () => (
    <>
        <div className={"block"}>
            {translate("All replies and the source recording will be automatically compiled into 1 video of everyone singing together after submitting each reply.")}
        </div>

        <div className={"block"}>
            {translate("Note: it may take time to process the videos (seconds or minutes, depending on the video length and quality).")}
        </div>
    </>
);

const SourceRecorderInstructionsStep = ({step, children, done = false}) => (
    <div className={"block"}>
        <WithLabel
            width={70}
            bold={true}
            label={<>
                {translate("Step %1", step)}&nbsp;
                {done && <span
                    className={"absolute"}
                    style={{
                        color: "#0c0",
                        marginTop: -3,
                    }}>
                    ✓
                </span>}
            </>}
        >
            {children}
        </WithLabel>
    </div>
);

const SourceRecorderForm = ({entryId, onSubmit}) => {
    const [entryName, setEntryName] = useState("");
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [failedToSubmit, setFailedToSubmit] = useState(false);

    const handleSubmit = (event) => {
        event.preventDefault();
        setFailedToSubmit(false);
        setFormSubmitted(true);
        updateMedia(entryId, {name: entryName})
            .then(onSubmit)
            .catch((error) => {
                console.error("Failed to update the entry", error);
                setFailedToSubmit(true);
                setFormSubmitted(false);
            });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className={"block"}>
                {translate("Your video was submitted successfully. What's the name of the project?")}
            </div>

            <div className={"block"}>
                <input
                    type={"text"}
                    className={"inline-block input-padding gray-borders border-radius"}
                    value={entryName}
                    onChange={event => setEntryName(event.target.value)}
                    required={true}
                    placeholder={translate("Type text...")}
                    disabled={formSubmitted}
                />

                <button
                    type={"submit"}
                    className={"inline-block input-padding gray-borders border-radius"}
                    disabled={formSubmitted}
                >
                    {translate("Done")}
                </button>

                {formSubmitted && <span className={"inline-block input-padding"}>
                    {translate("Saving...")}
                </span>}

                {failedToSubmit && <span className={"inline-block input-padding"}>
                    <Error>{translate("Something went wrong. Please try again.")}</Error>
                </span>}
            </div>
        </form>
    );
};
