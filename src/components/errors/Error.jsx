import React from "react";

import styles from "./Error.module.css";

export const Error = ({children, className = "", ...divProps}) => (
    <div
        className={`${styles.component} ${className}`}
        {...divProps}
    >
        {children}
    </div>
);
