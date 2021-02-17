import React, {useState} from "react";

import {CopyToClipboard} from "react-copy-to-clipboard";
import {useScopedPromise} from "../hooks/useScopedPromise";
import {timeoutPromise} from "../misc/timeoutPromise";
import {translate} from "../locales/translate";
import {WithLabel} from "./WithLabel";

export const CopyToClipboardInput = ({text, label, labelWidth, inputWidth, onCopy}) => {
    const [copied, setCopied] = useState(false);
    const [, setResetCopiedPromise] = useScopedPromise();

    const handleCopy = () => {
        setCopied(true);
        onCopy && onCopy();

        const timeout = timeoutPromise(1000);
        setResetCopiedPromise(timeout);
        timeout.then(() => setCopied(false));
    };

    return (
        <div className={"block align-children-top"}>
            <WithLabel
                width={labelWidth}
                labelClassName={"vertical-input-padding"}
                label={label}
            >
                <input
                    type={"text"}
                    readOnly={true}
                    className={"ltr inline-margin input-padding gray-borders border-radius"}
                    style={{width: inputWidth}}
                    value={text}
                    onFocus={event => event.target.select()}
                    onCopy={handleCopy}
                />
            </WithLabel>

            <span>
                <CopyToClipboard text={text} onCopy={handleCopy}>
                    <button type={"button"} className={"inline-margin input-padding gray-borders border-radius"}>
                        {translate("Copy")}
                    </button>
                </CopyToClipboard>

                {copied && <span>{translate("Copied.")}</span>}
            </span>
        </div>
    );
};
