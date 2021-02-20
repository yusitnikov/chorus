import React from "react";
import {Error} from "./Error";
import {Layout} from "../Layout";
import {useTranslate} from "../../contexts/app";

export const PageNotFound = ({title}) => {
    const translate = useTranslate();

    return (
        <Layout title={title || translate("Page not found")}>
            <Error>
                {translate("This is not the page you're looking for.")}
            </Error>
        </Layout>
    );
};
