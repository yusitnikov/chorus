import React, {forwardRef} from "react";

import "./VideoHolder.css";

import {playerAspectRatio} from "../misc/playerAspectRatio";

export const defaultPlayerWidth = 640;
export const defaultPlayerHeight = defaultPlayerWidth * playerAspectRatio;

export const VideoHolder = forwardRef(({width = defaultPlayerWidth, children}, ref) => (
    <div
        ref={ref}
        className={"VideoHolder relative"}
        style = {{
            width,
        }}
    >
        <div className={"VideoHolder__Container relative"}>
            {children}
        </div>
    </div>
));
