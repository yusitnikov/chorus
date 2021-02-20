// An HTTP webhook for the "Entry Status Equals" HTTP notification for the READY status (2) should point to /api/ready
import {compileByEntryId} from "./compile/[entryId]";

// Don't try to parse the POST body automatically
export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function ready(request, response) {
    console.log("    entry ready");

    if (request.method !== "POST") {
        console.error("    request is not POST")
        response.status(500).send("Internal server error");
        return;
    }

    const dataStr = await new Promise(resolve => {
        let dataStr = "";
        request.on("data", chunk => dataStr += chunk);
        request.on("end", () => resolve(dataStr));
    });

    if (!dataStr) {
        console.error("    empty POST data")
        response.status(500).send("Internal server error");
        return;
    }

    let data;
    try {
        data = JSON.parse(dataStr);
    } catch (error) {
        console.error("    failed to JSON parse the POST data")
        response.status(500).send("Internal server error");
        return;
    }

    // Return the response early, don't wait for the background processing
    response.status(200).send("ok");

    // noinspection ES6MissingAwait
    compileByEntryId(data?.object?.id, request, response);
}
