import React from "react";

import {Link} from "react-router-dom";
import {translate} from "../../locales/translate";
import {Layout} from "../Layout";
import {createProjectUrl} from "../../misc/url";

export const HomePage = () => {
    return (
        <Layout title={translate("About the service")}>
            <div className={"block"}>
                <Link to={createProjectUrl}>{translate("Try creating a new project")}</Link>
            </div>
        </Layout>
    )
};
