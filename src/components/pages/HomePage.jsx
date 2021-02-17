import React from "react";

import {Link} from "react-router-dom";
import {translate} from "../../locales/translate";
import {Layout} from "../Layout";

export const HomePage = () => {
    return (
        <Layout title={translate("Welcome to the Chorus project!")}>
            <div className={"block"}>
                <Link to={"/create"}>{translate("Try creating a new project")}</Link>
            </div>
        </Layout>
    )
};
