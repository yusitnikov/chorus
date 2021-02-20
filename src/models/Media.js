import {enums, objects, services} from "kaltura-client";
import {createClientWithKs, executeKalturaRequest} from "../misc/kalturaClient";
import {cacheGet, cacheRemove, cacheSet} from "../services/cache";
import {clearProjectRepliesCacheByEntry} from "./Project";

export const isMediaReady = (entry) => entry.status.toString() === enums.EntryStatus.READY.toString();

const getMediaGetCacheKey = (entryId) => `media:get:${entryId}`;

const clearMediaGetCache = (entryId) => cacheRemove(getMediaGetCacheKey(entryId));

const updateMediaGetCache = (entry) => cacheSet(
    getMediaGetCacheKey(entry.id),
    entry
);

export const loadMediaById = async(client, id, useCache = true, waitForSetCache = false) => {
    const cacheKey = getMediaGetCacheKey(id);

    if (useCache) {
        const entryFromCache = await cacheGet(cacheKey);
        if (entryFromCache) {
            return entryFromCache;
        }
    }

    const entry = await executeKalturaRequest(client, services.media.get(id));

    const cacheSetPromise = cacheSet(cacheKey, entry);
    if (waitForSetCache) {
        await cacheSetPromise;
    }

    return entry;
};

const getMediaListCacheKey = (key) => `media:list:${key}`;

export const clearMediaListCache = (key) => cacheRemove(getMediaListCacheKey(key));

export const loadMediaList = async(client, filter, cacheKey, useCache = true) => {
    const fullCacheKey = getMediaListCacheKey(cacheKey);

    if (useCache) {
        const objectsFromCache = await cacheGet(fullCacheKey);
        if (objectsFromCache) {
            return objectsFromCache;
        }
    }

    const objectsFromApi = await executeKalturaRequest(client, services.media.listAction(
        new objects.MediaEntryFilter({
            orderBy: enums.MediaEntryOrderBy.CREATED_AT_ASC,
            statusIn: "1,2",
            ...filter,
        }),
        new objects.FilterPager({pageSize: 500})
    )).then(response => response.objects);

    // Don't wait for the cache promises
    cacheSet(fullCacheKey, objectsFromApi);
    for (const entry of objectsFromApi) {
        updateMediaGetCache(entry);
    }

    return objectsFromApi;
};

export const addMedia = async(client, data, contentPath) => {
    let entry = await executeKalturaRequest(client, services.media.add(new objects.MediaEntry(data)));

    await clearProjectRepliesCacheByEntry(entry);

    if (contentPath) {
        let uploadToken = await executeKalturaRequest(client, services.uploadToken.add(new objects.UploadToken()));

        // Extended timeout for the upload
        const uploadClient = createClientWithKs(client.getKs(), 1800000);
        uploadToken = await executeKalturaRequest(uploadClient, services.uploadToken.upload(uploadToken.id, contentPath));

        entry = await executeKalturaRequest(client, services.media.addContent(entry.id, new objects.UploadedFileTokenResource({token: uploadToken.id})));

        await clearProjectRepliesCacheByEntry(entry);
    }

    return entry;
};

export const updateMedia = async(client, id, data) => {
    const entry = await executeKalturaRequest(client, services.media.update(id, new objects.MediaEntry(data)));

    await updateMediaGetCache(entry);
    await clearProjectRepliesCacheByEntry(entry);

    return entry;
};

export const updateMediaClientSide = (id, data) => fetch(
    `/api/update/${id}`,
    {
        method: "POST",
        body: JSON.stringify(data),
    }
).then(data => data.json());

export const deleteMedia = async(client, id) => {
    try {
        const entry = await loadMediaById(client, id, true, true);
        await clearProjectRepliesCacheByEntry(entry);
    } catch (error) {
        // Ignore
    }

    await executeKalturaRequest(client, services.media.deleteAction(id));

    clearMediaGetCache(id);
};
