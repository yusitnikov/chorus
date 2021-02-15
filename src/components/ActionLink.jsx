import React from "react";

export const ActionLink = ({onClick, ...linkProps}) => {
    const handleClick = (event) => {
        event.preventDefault();

        onClick();
    };

    return (
        <a
            href={"#"}
            onClick={handleClick}
            {...linkProps}
        />
    );
};
