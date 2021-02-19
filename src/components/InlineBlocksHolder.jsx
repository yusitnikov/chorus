import React from "react";

import "./InlineBlocksHolder.css";

export const InlineBlocksHolder = ({className = "", children, ...divProps}) => {
    return (
        <div className={`InlineBlocksHolder ${className}`}{...divProps}>
            <div className={"InlineBlocksHolder__Inner"}>
                {children}
            </div>
        </div>
    );
};
