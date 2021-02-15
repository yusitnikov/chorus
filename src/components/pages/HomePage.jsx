import React from "react";

import {Link} from "react-router-dom";
import {translate} from "../../locales/translate";

export const HomePage = () => {
    return (
        <>
            <h1 className={"block"}>
                {translate("Welcome to the Chorus project!")}
            </h1>

            <div className={"block"}>
                <Link to={"/create"}>{translate("Try creating a new project")}</Link>
            </div>
        </>
    )
};
