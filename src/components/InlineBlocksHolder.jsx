import React from "react";

import styles from "./InlineBlocksHolder.module.css";

export const InlineBlocksHolder = ({className = "", children, ...divProps}) => {
    return (
        <div className={`${styles.component} ${className}`}{...divProps}>
            <div className={styles.inner}>
                {children}
            </div>
        </div>
    );
};
