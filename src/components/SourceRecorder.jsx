import React, {useState} from "react";
import {Recorder, RecorderState} from "./Recorder";
import {Redirect} from "react-router-dom";
import {translate} from "../locales/translate";
import {updateMedia} from "../models/Media";

export const SourceRecorder = () => {
    const [state, setState] = useState(null);
    const [entryId, setEntryId] = useState(null);
    const [entryName, setEntryName] = useState("");
    const [formSubmitted, setFormSubmitted] = useState(false);

    if (entryId && formSubmitted) {
        return <Redirect to={`/view/${entryId}`}/>;
    }

    if (entryId && state === RecorderState.done) {
        const handleSubmit = (event) => {
            event.preventDefault();
            updateMedia(entryId, {name: entryName})
                .then(() => setFormSubmitted(true));
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
                    />

                    <button
                        type={"submit"}
                        className={"inline-block input-padding gray-borders border-radius"}
                    >
                        {translate("Done")}
                    </button>
                </div>
            </form>
        );
    }

    return (
        <div className={"inline-block"}>
            <Recorder onStateChanged={setState} onUploadedEntryIdChanged={setEntryId}/>
        </div>
    );
};
