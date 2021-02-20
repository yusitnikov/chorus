import React, {useState} from "react";

import {CopyToClipboard} from "react-copy-to-clipboard";
import {useScopedPromise} from "../hooks/useScopedPromise";
import {timeoutPromise} from "../misc/timeoutPromise";
import {WithLabel} from "./WithLabel";
import {InlineBlocksHolder} from "./InlineBlocksHolder";
import {useTranslate} from "../contexts/app";

export const CopyToClipboardInput = ({text, label, labelWidth, inputWidth, onCopy}) => {
    const translate = useTranslate();

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
        <InlineBlocksHolder className={"block align-children-top"}>
            <WithLabel
                width={labelWidth}
                className={"mobile-only-block inline-margin"}
                labelClassName={"vertical-input-padding"}
                label={label}
            >
                <input
                    type={"text"}
                    readOnly={true}
                    className={"ltr input-padding gray-borders border-radius"}
                    style={{
                        width: inputWidth,
                        maxWidth: "calc(100% - 22px)",
                    }}
                    value={text}
                    onFocus={event => event.target.select()}
                    onCopy={handleCopy}
                />
            </WithLabel>

            <div className={"inline-block"}>
                <CopyToClipboard text={text} onCopy={handleCopy}>
                    <button type={"button"} className={"inline-margin input-padding gray-borders border-radius"}>
                        {translate("Copy")}
                    </button>
                </CopyToClipboard>

                <span
                    style={{
                        opacity: copied ? 1 : 0,
                        transition: "opacity 0.5s",
                    }}
                >
                    {translate("Copied.")}
                </span>
            </div>
        </InlineBlocksHolder>
    );
};
