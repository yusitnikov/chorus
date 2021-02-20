import React from "react";

import styles from "./WithLabel.module.css";

export const WithLabel = ({label, width, bold = false, className = "", labelClassName = "", children, ...labelProps}) => {
    return (
        <label
            className={`${styles.component} ${className}`}
            {...labelProps}
        >
            <div
                className={labelClassName}
                style={{
                    width,
                    flex: `0 0 ${width}px`,
                }}
            >
                {bold ? <strong>{label}</strong> : label}
            </div>

            <div>
                {children}
            </div>
        </label>
    );
};
