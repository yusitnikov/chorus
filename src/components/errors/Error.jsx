import React from "react";

import "./Error.css";

export const Error = ({children, className = "", ...divProps}) => (
    <div
        className={`Error ${className}`}
        {...divProps}
    >
        {children}
    </div>
);
