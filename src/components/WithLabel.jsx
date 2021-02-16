import React from "react";

import "./WithLabel.css";

export const WithLabel = ({label, width, className = "", children, ...divProps}) => {
    return (
        <div
            className={`WithLabel ${className}`}
            {...divProps}
        >
            <div
                className={"WithLabel__Label"}
                style={{
                    width,
                    flex: `0 0 ${width}px`,
                }}
            >
                <strong>{label}</strong>
            </div>
            <div className={"WithLabel__Content"}>
                {children}
            </div>
        </div>
    );
};
