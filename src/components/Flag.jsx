import React from "react";

export const Flag = ({code, name, size, className = "", style = {}, ...imgProps}) => {
    return (
        <img
            src={`${process.env.PUBLIC_URL}/flags/${code}.svg`}
            className={`Flag ${className}`}
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
