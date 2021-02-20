// An HTTP webhook for the "Entry Status Equals" HTTP notification for the READY status (2) should point to /api/ready
import {compileByEntryId} from "./compile/[entryId]";

export default function ready(request, response) {
    console.log("    entry ready");

    if (request.method !== "POST") {
        console.error("    request is not POST")
        response.status(500).send("Internal server error");
    }

    let {data} = request;

    if (!data) {
        console.error("    empty POST data")
        response.status(500).send("Internal server error");
    }

    if (typeof data === "string") {
        try {
            data = JSON.parse(data);
        } catch (error) {
            console.error("    JSON parse error:", error)
        }
    }

    // Return the response early, don't wait for the background processing
    response.status(200).send("ok");

    // noinspection JSIgnoredPromiseFromCall
    compileByEntryId(data?.object?.id, request, response);
}
