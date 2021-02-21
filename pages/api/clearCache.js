import {cacheFlush} from "../../src/services/cache";

// noinspection JSUnusedGlobalSymbols
export default function clearCache(request, response) {
    console.log("    clear cache");

    response.status(200).send("ok");

    // Don't wait for the promise
    cacheFlush();
}
