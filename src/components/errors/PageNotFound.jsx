import React from "react";
import {Error} from "./Error";
import {translate} from "../../locales/translate";
import {Layout} from "../Layout";

export const PageNotFound = ({title = translate("Page not found")}) => (
    <Layout title={title}>
        <Error>
            {translate("This is not the page you're looking for.")}
        </Error>
    </Layout>
);
