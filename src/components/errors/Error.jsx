import React from "react";

export const Error = ({title, children}) => {
    return (
        <>
            {title && <h1 className={"block"}>{title}</h1>}

            <div className={"block"}>{children}</div>
        </>
    )
};
