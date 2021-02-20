import {apiConfig, parseApiJsonBody} from "../../../src/misc/parseApiJsonBody";
import {createClientWithKs, createKs} from "../../../src/misc/kalturaClient";
import {updateMedia} from "../../../src/models/Media";

// Don't try to parse the POST body automatically
export const config = apiConfig;

export default async function update(request, response) {
    console.log("    update media");

    try {
        const {entryId} = request.query;

        const data = await parseApiJsonBody(request);

        const client = createClientWithKs(await createKs(false));
        const entry = await updateMedia(client, entryId, data);

        response.status(200).json(entry);
    } catch (error) {
        console.error(`    ${error}`)
        response.status(500).send("Internal server error");
    }
}
