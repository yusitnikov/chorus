import React, {forwardRef} from "react";

import styles from "./VideoHolder.module.css";

export const defaultPlayerWidth = 640;

export const VideoHolder = forwardRef(({width = defaultPlayerWidth, children}, ref) => (
    <div
        ref={ref}
        className={`${styles.component} relative`}
        style = {{
            width,
        }}
    >
        <div className={`${styles.container} relative`}>
            {children}
        </div>
    </div>
));
