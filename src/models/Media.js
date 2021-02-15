import {enums, objects, services} from "kaltura-client";
import {executeKalturaRequest} from "../misc/kalturaClient";
import {useLoader} from "../hooks/useLoader";
import {immediatePromise} from "../misc/immediatePromise";

let mediaGetCache = {};
let mediaListCache = {};

const clearMediaCache = () => {
    mediaGetCache = {};
    mediaListCache = {};
};

export const isMediaReady = (entry) => entry.status.toString() === enums.EntryStatus.READY.toString();

export const loadMediaById = (id, useCache = false) => {
    if (useCache && mediaGetCache[id]) {
        return immediatePromise(mediaGetCache[id]);
    }

    const resultPromise = executeKalturaRequest(services.media.get(id));

    if (useCache) {
        mediaGetCache[id] = resultPromise;
        mediaGetCache[id].then(result => mediaGetCache[id] = result);
    }

    return resultPromise;
};
export const useLoadMediaById = (id) => useLoader(() => id ? loadMediaById(id, true) : immediatePromise(null), [id]);

export const loadMediaList = (filter, useCache = false) => {
    const key = JSON.stringify(filter);

    if (useCache && mediaListCache[key]) {
        return immediatePromise(mediaListCache[key]);
    }

    const objectsPromise = executeKalturaRequest(services.media.listAction(
        new objects.MediaEntryFilter({
            orderBy: enums.MediaEntryOrderBy.CREATED_AT_ASC,
            statusIn: "1,2",
            ...filter,
        }),
        new objects.FilterPager({pageSize: 500})
    )).then(response => response.objects);

    if (useCache) {
        mediaListCache[key] = objectsPromise;
        objectsPromise.then(objects => {
            mediaListCache[key] = objects;
            for (const entry of objects) {
                mediaGetCache[entry.id] = entry;
            }
        });
    }

    return objectsPromise;
};
export const useLoadMediaList = (filter) => useLoader(() => filter ? loadMediaList(filter) : immediatePromise(null), [JSON.stringify(filter)]);

export const loadMediaChildren = (entryId, useCache = false) => loadMediaList({parentEntryIdEqual: entryId}, useCache);
export const useLoadMediaChildren = (entryId) => useLoader(() => entryId ? loadMediaChildren(entryId, true) : immediatePromise(null), [entryId]);

export const addMedia = async(data, contentPath) => {
    clearMediaCache();

    let entry = await executeKalturaRequest(services.media.add(new objects.MediaEntry(data)));

    if (contentPath) {
        let uploadToken = await executeKalturaRequest(services.uploadToken.add(new objects.UploadToken()));
        uploadToken = await executeKalturaRequest(services.uploadToken.upload(uploadToken.id, contentPath));
        entry = await executeKalturaRequest(services.media.addContent(entry.id, new objects.UploadedFileTokenResource({token: uploadToken.id})));
    }

    return entry;
};

export const updateMedia = (id, data) => {
    clearMediaCache();

    return executeKalturaRequest(services.media.update(id, new objects.MediaEntry(data)));
};

export const deleteMedia = (id) => {
    clearMediaCache();

    return executeKalturaRequest(services.media.deleteAction(id));
};
