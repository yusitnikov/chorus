import path from "path";
import fs from "fs";
import {enums} from "kaltura-client";
import {createClientWithKs, createKs} from "../../../src/misc/kalturaClient";
import ffmpeg from "fluent-ffmpeg";
import {
    getProjectCompilationId,
    getProjectIdByEntry,
    isProjectSourceEntry,
    loadProjectReplies
} from "../../../src/models/Project";
import {addMedia, deleteMedia, isMediaReady, loadMediaById, updateMedia} from "../../../src/models/Media";
import {downloadUrl} from "../../../src/utils/downloadUrl";
import {playerAspectRatio} from "../../../src/misc/playerAspectRatio";
import {abortablePromise} from "../../../src/misc/abortablePromise";

const ffmpegProcesses = {};

export default function compile(request, response) {
    // Return the response early, don't wait for the background processing
    response.status(200).send("ok");

    // noinspection JSIgnoredPromiseFromCall
    compileByEntryId(request.query.entryId);
}

export async function compileByEntryId(entryId) {
    console.log(`    compile ${entryId}!`);

    try {
        const ks = await createKs(true);
        const client = createClientWithKs(ks);

        const entry = await loadMediaById(client, entryId);

        const projectId = getProjectIdByEntry(entry);
        console.log(`    project ID is ${projectId}`);
        const source = projectId === entryId ? entry : await loadMediaById(client, projectId);

        if (!isProjectSourceEntry(source)) {
            console.log("    The entry is not a Chorus project, skipping");
            return;
        }

        const previousCompilationId = getProjectCompilationId(source);

        if (entryId === previousCompilationId) {
            console.log("    Compilation process was requested by the compilation entry ID, skipping (because of a possible ENTRY READY notification loop");
            return;
        }

        let replies = await loadProjectReplies(client, source);
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
            ffmpegCommand.input(downloadUrl(entry, ks));
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

        const outputPath = path.resolve(process.cwd(), "tmp", `${source.id}.mp4`);
        ffmpegCommand.save(outputPath);

        // Do the processing in the background, free the HTTP server from waiting
        try {
            await ffmpegPromise;

            console.log(`    finished processing ${source.id} - uploading to the entry`);

            const compilation = await addMedia(client, {
                name: "Compilation",
                mediaType: enums.MediaType.VIDEO,
                displayInSearch: enums.EntryDisplayInSearchType.SYSTEM,
            }, outputPath);
            console.log(`    uploaded the compilation as ${compilation.id}`);

            await updateMedia(client, source.id, {referenceId: compilation.id});
            console.log(`    linked compilation ${compilation.id} to the project ${source.id}`);

            if (previousCompilationId) {
                await deleteMedia(client, previousCompilationId);
                console.log(`    removed the previous compilation asset: ${previousCompilationId}`);
            }
        } finally {
            delete ffmpegProcesses[source.id];

            console.log(`    removing temporary file for ${source.id}`);
            if (fs.existsSync(outputPath)) {
                fs.unlinkSync(outputPath);
            }
        }
    } catch (error) {
        console.error(`    Error compiling ${entryId}`, error);
    }
}
