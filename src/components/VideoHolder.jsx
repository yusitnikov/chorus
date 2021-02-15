import React, {forwardRef} from "react";
import {playerAspectRatio} from "../misc/playerAspectRatio";

export const defaultPlayerWidth = 640;
export const defaultPlayerHeight = defaultPlayerWidth * playerAspectRatio;

export const VideoHolder = forwardRef(({className = '', width = defaultPlayerWidth, style = {}, ...props}, ref) => (
    <div
        {...props}
        ref={ref}
        className={`VideoHolder relative ${className}`}
        style = {{
            ...style,
            width,
            height: width * playerAspectRatio,
        }}
    />)
);
