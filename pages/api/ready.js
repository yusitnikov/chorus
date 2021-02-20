// An HTTP webhook for the "Entry Status Equals" HTTP notification for the READY status (2) should point to /api/ready
import {compileByEntryId} from "./compile/[entryId]";
import {apiConfig, parseApiJsonBody} from "../../src/misc/parseApiJsonBody";

// Don't try to parse the POST body automatically
export const config = apiConfig;

export default async function ready(request, response) {
    console.log("    entry ready");

    let data;
    try {
        data = await parseApiJsonBody(request);
    } catch (error) {
        console.error(`    ${error}`)
        response.status(500).send("Internal server error");
        return;
    }

    // Return the response early, don't wait for the background processing
    response.status(200).send("ok");

    // noinspection ES6MissingAwait
    compileByEntryId(data?.object?.id, request, response);
}
