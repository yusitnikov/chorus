import React from "react";

import "./WithLabel.css";

export const WithLabel = ({label, width, bold = false, className = "", labelClassName = "", children, ...labelProps}) => {
    return (
        <label
            className={`WithLabel ${className}`}
            {...labelProps}
        >
            <div
                className={`WithLabel__Label ${labelClassName}`}
                style={{
                    width,
                    flex: `0 0 ${width}px`,
                }}
            >
                {bold ? <strong>{label}</strong> : label}
            </div>
            <div className={"WithLabel__Content"}>
                {children}
            </div>
        </label>
    );
};
