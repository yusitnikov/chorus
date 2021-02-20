import {enums, objects, services} from "kaltura-client";
import {createClientWithKs, executeKalturaRequest} from "../misc/kalturaClient";
import {immediatePromise} from "../misc/immediatePromise";

let mediaGetCache = {};
let mediaListCache = {};

const clearMediaCache = () => {
    mediaGetCache = {};
    mediaListCache = {};
};

export const isMediaReady = (entry) => entry.status.toString() === enums.EntryStatus.READY.toString();

export const loadMediaById = (client, id, useCache = false) => {
    if (useCache && mediaGetCache[id]) {
        return immediatePromise(mediaGetCache[id]);
    }

    const resultPromise = executeKalturaRequest(client, services.media.get(id));

    if (useCache) {
        mediaGetCache[id] = resultPromise;
        mediaGetCache[id]
            .then(result => mediaGetCache[id] = result)
            .catch(() => delete mediaGetCache[id]);
    }

    return resultPromise;
};

export const loadMediaList = (client, filter, useCache = false) => {
    const key = JSON.stringify(filter);

    if (useCache && mediaListCache[key]) {
        return immediatePromise(mediaListCache[key]);
    }

    const objectsPromise = executeKalturaRequest(client, services.media.listAction(
        new objects.MediaEntryFilter({
            orderBy: enums.MediaEntryOrderBy.CREATED_AT_ASC,
            statusIn: "1,2",
            ...filter,
        }),
        new objects.FilterPager({pageSize: 500})
    )).then(response => response.objects);

    if (useCache) {
        mediaListCache[key] = objectsPromise;
        objectsPromise
            .then(objects => {
                mediaListCache[key] = objects;
                for (const entry of objects) {
                    mediaGetCache[entry.id] = entry;
                }
            })
            .catch(() => delete mediaListCache[key]);
    }

    return objectsPromise;
};

export const addMedia = async(client, data, contentPath) => {
    clearMediaCache();

    let entry = await executeKalturaRequest(client, services.media.add(new objects.MediaEntry(data)));

    if (contentPath) {
        let uploadToken = await executeKalturaRequest(client, services.uploadToken.add(new objects.UploadToken()));

        // Extended timeout for the upload
        const uploadClient = createClientWithKs(client.getKs(), 1800000);
        uploadToken = await executeKalturaRequest(uploadClient, services.uploadToken.upload(uploadToken.id, contentPath));

        entry = await executeKalturaRequest(client, services.media.addContent(entry.id, new objects.UploadedFileTokenResource({token: uploadToken.id})));
    }

    return entry;
};

export const updateMedia = (client, id, data) => {
    clearMediaCache();

    return executeKalturaRequest(client, services.media.update(id, new objects.MediaEntry(data)));
};

export const deleteMedia = (client, id) => {
    clearMediaCache();

    return executeKalturaRequest(client, services.media.deleteAction(id));
};
