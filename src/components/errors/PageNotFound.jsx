import React from "react";
import {Error} from "./Error";
import {translate} from "../../locales/translate";

export const PageNotFound = ({title = translate("Page not found")}) => (
    <Error title={title}>
        {translate("This is not the page you're looking for.")}
    </Error>
);
