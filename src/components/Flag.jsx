import React from "react";

export const Flag = ({code, name, size, style = {}, ...imgProps}) => {
    return (
        <img
            src={`${process.env.PUBLIC_URL}/flags/${code}.svg`}
            className={"block LanguageSelectionScreenItem__Flag"}
            title={name}
            alt={name}
            style={{
                ...style,
                width: size,
                height: size,
            }}
            {...imgProps}
        />
    );
};
