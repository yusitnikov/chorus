import http from "http";
import https from "https";
import nodeStatic from "node-static";
import path from "path";
import fs from "fs";
import {enums, services} from "kaltura-client";
import {executeKalturaRequest, kalturaClient} from "../src/misc/kalturaClient";
import ffmpeg from "fluent-ffmpeg";
import {
    getProjectCompilationId,
    getProjectIdByEntry,
    isProjectSourceEntry,
    loadProjectReplies
} from "../src/models/Project";
import {addMedia, deleteMedia, isMediaReady, loadMediaById, updateMedia} from "../src/models/Media";
import {downloadUrl} from "../src/utils/downloadUrl";
import {playerAspectRatio} from "../src/misc/playerAspectRatio";
import {abortablePromise} from "../src/misc/abortablePromise";

const port = Number(process.argv[2] || 80);

const fileServer = new nodeStatic.Server(path.resolve(__dirname, "../build"));

const createKs = (admin) => executeKalturaRequest(services.session.start(
    process.env.REACT_APP_ADMIN_SECRET,
    "chorus",
    admin ? enums.SessionType.ADMIN : enums.SessionType.USER,
    process.env.REACT_APP_PARTNER_ID,
    86400,
    admin ? "disableentitlement" : "editadmintags:*"
));

const ffmpegProcesses = {};

console.log("Initialized, waiting for connections...");

const processConfigRequest = async(request, response) => {
    console.log("    config!");
    response.setHeader("Content-Type", "application/javascript");
    response.end("window.config = " + JSON.stringify({
        ks: await createKs(false),
    }));
};

const processStaticAssestRequest = (request, response) => {
    console.log("    static file!");
    return request.url.includes(".")
        ? fileServer.serve(request, response)
        : fileServer.serveFile("/index.html", 200, {}, request, response);
};

const processCompilationRequest = async(entryId, request, response) => {
    console.log(`    compile ${entryId}!`);

    // Return the response early, don't wait for the background processing
    response.end("ok");

    const entry = await loadMediaById(entryId);

    const projectId = getProjectIdByEntry(entry);
    console.log(`    project ID is ${projectId}`);
    const source = projectId === entryId ? entry : await loadMediaById(projectId);

    if (!isProjectSourceEntry(source)) {
        console.log("    The entry is not a Chorus project, skipping");
        return;
    }

    const previousCompilationId = getProjectCompilationId(source);

    if (entryId === previousCompilationId) {
        console.log("    Compilation process was requested by the compilation entry ID, skipping (because of a possible ENTRY READY notification loop");
        return;
    }

    let replies = await loadProjectReplies(source);
    if (!replies.length) {
        console.log("    There are no replies yet, skipping");
        return;
    }

    const sources = [source, ...replies];

    for (const sourceEntry of sources) {
        if (!isMediaReady(sourceEntry)) {
            console.log(`    Media ${sourceEntry.id} is not ready yet, skipping`);
            return;
        }
    }

    const sourcesCount = sources.length;
    const hFramesCount = Math.ceil(Math.sqrt(sourcesCount));
    const vFramesCount = Math.ceil(sourcesCount / hFramesCount);
    const lastLineOffset = (hFramesCount * vFramesCount - sourcesCount) / 2;

    const roundSize = size => Math.round(size / 8) * 8;
    const frameWidth = roundSize(1280 / hFramesCount);
    const frameHeight = roundSize(frameWidth * playerAspectRatio);

    if (ffmpegProcesses[source.id]) {
        console.log(`    a background process for ${source.id} already exists, killing it`);
        ffmpegProcesses[source.id].process.kill();
        ffmpegProcesses[source.id].promise.abort();
        delete ffmpegProcesses[source.id];
        console.log(`    killed`);
    } else {
        console.log(`    no concurrent background processes for ${source.id}`);
    }

    const ffmpegCommand = ffmpeg({timeout: 60});
    const ffmpegPromise = abortablePromise(new Promise((resolve, reject) => {
        ffmpegCommand.on("error", ({message}) => reject(message));
        ffmpegCommand.on("end", () => resolve());
    }));
    ffmpegProcesses[source.id] = {
        process: ffmpegCommand,
        promise: ffmpegPromise,
    };

    for (const entry of sources) {
        ffmpegCommand.input(downloadUrl(entry, kalturaClient.getKs()));
    }

    const ffmpegScaleFilters = [];
    let ffmpegScaleOutputs = "";
    let ffmpegLayout = [];
    let ffmpegAudioInputs = "";
    for (const [index] of sources.entries()) {
        const videoChannel = `${index}:v`;
        const audioChannel = `${index}:a`;

        const scaledChannel = `s${index}`;
        const paddedChannel = `p${index}`;

        ffmpegScaleFilters.push(
            `[${videoChannel}]scale=w=${frameWidth}:h=${frameHeight}:force_original_aspect_ratio=1[${scaledChannel}]`,
            `[${scaledChannel}]pad=${frameWidth}:${frameHeight}:(ow-iw)/2:(oh-ih)/2:color=black[${paddedChannel}]`
        );

        ffmpegScaleOutputs += `[${paddedChannel}]`;
        ffmpegAudioInputs += `[${audioChannel}]`;

        const hIndex = Math.floor(index / hFramesCount);
        const vIndex = (index % hFramesCount) + (hIndex === vFramesCount - 1 ? lastLineOffset : 0);
        ffmpegLayout.push(`${hIndex * frameWidth}_${vIndex * frameHeight}`);
    }


    ffmpegCommand.complexFilter([
        ...ffmpegScaleFilters,
        `${ffmpegScaleOutputs}xstack=inputs=${sourcesCount}:layout=${ffmpegLayout.join("|")}[v]`,
        `${ffmpegAudioInputs}amix=inputs=${sourcesCount}:duration=longest[a]`,
    ], ["v", "a"]);

    ffmpegCommand.audioChannels(2);

    const outputPath = path.resolve(__dirname, "..", "tmp", `${source.id}.mp4`);
    ffmpegCommand.save(outputPath);

    // Do the processing in the background, free the HTTP server from waiting
    ffmpegPromise
        .then(async() => {
            console.log(`    finished processing ${source.id} - uploading to the entry`);

            const compilation = await addMedia({
                name: "Compilation",
                mediaType: enums.MediaType.VIDEO,
                displayInSearch: enums.EntryDisplayInSearchType.SYSTEM,
            }, outputPath);
            console.log(`    uploaded the compilation as ${compilation.id}`);

            await updateMedia(source.id, {referenceId: compilation.id});
            console.log(`    linked compilation ${compilation.id} to the project ${source.id}`);

            if (previousCompilationId) {
                await deleteMedia(previousCompilationId);
                console.log(`    removed the previous compilation asset: ${previousCompilationId}`);
            }
        })
        .catch(error => {
            console.error(`    failed processing ${source.id}`);
            console.error(error);
        })
        .finally(() => {
            delete ffmpegProcesses[source.id];

            console.log(`    removing temporary file for ${source.id}`);
            if (fs.existsSync(outputPath)) {
                fs.unlinkSync(outputPath);
            }
        });
};

// An HTTP webhook for the "Entry Status Equals" HTTP notification for the READY status (2) should point to /api/ready
const processReadyWebhook = (request, response) => new Promise(resolve => {
    console.log("    entry ready");

    let dataStr = "";
    request.on("data", chunk => dataStr += chunk);
    request.on("end", async() => {
        // Free the request early
        resolve();

        try {
            const data = JSON.parse(dataStr);
            await processCompilationRequest(data.object.id, request, response);
        } catch (error) {
            console.error(error);
        }
    });
});

const processMainRequest = async(request, response) => {
    console.log(`--> ${request.method} ${request.url}`);

    try {
        const urlParts = request.url.split("/");

        if (urlParts[1] !== "api") {
            await processStaticAssestRequest(request, response);
        } else {
            // Refresh the KS of the main client
            kalturaClient.setKs(await createKs(true));

            switch (urlParts[2]) {
                case "config":
                    await processConfigRequest(request, response);
                    break;

                case "compile":
                    await processCompilationRequest(urlParts[3], request, response);
                    break;

                case "ready":
                    await processReadyWebhook(request, response);
                    break;

                default:
                    response.writeHead(404);
                    response.end("Page not found");
                    break;
            }
        }

        console.log(`OK  ${request.method} ${request.url}`);
    } catch (error) {
        console.log(`ERR ${request.method} ${request.url}`);
        console.error(error);
        response.writeHead(500);
        response.end("Internal Server Error");
    }
};

if (process.env.SSL_KEY_PATH) {
    const httpsOptions = {
        key: fs.readFileSync(process.env.SSL_KEY_PATH),
        cert: fs.readFileSync(process.env.SSL_CERT_PATH),
        ca: fs.readFileSync(process.env.SSL_CA_PATH),
    };
    https.createServer(httpsOptions, processMainRequest).listen(443);

    // Redirect all HTTP to HTTPS
    http.createServer((request, response) => {
        console.log(`REDIRECT ${request.url} to HTTPS`);
        response.writeHead(302, {
            Location: `https://${request.headers.host}${request.url}`
        });
        response.end();
    }).listen(port);
} else {
    http.createServer(processMainRequest).listen(port);
}
