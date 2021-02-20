import {clearMediaListCache, loadMediaList} from "./Media";
import {useTranslate} from "../contexts/app";

export const projectAdminTag = "chorus";

export const getProjectIdByEntry = (entry) => entry.parentEntryId || entry.id;

export const isProjectSourceEntry = (source) => source.adminTags && source.adminTags.indexOf(projectAdminTag) >= 0;

export const getProjectCompilationId = (sourceEntry) => sourceEntry.referenceId;

const getRepliesCacheKey = (projectId) => `projectReplies:${projectId}`;

export const loadProjectReplies = (client, source, useCache = true) => loadMediaList(
    client,
    {
        parentEntryIdEqual: source.id,
        idNotIn: getProjectCompilationId(source) || undefined,
    },
    getRepliesCacheKey(source.id),
    useCache
);

export const clearProjectRepliesCacheByEntry = async(entry) => {
    const projectId = getProjectIdByEntry(entry);

    if (projectId !== entry.id) {
        await clearMediaListCache(getRepliesCacheKey(projectId));
    }
};

export const useProjectEntryNamesMap = (projectId, compilationId, replies) => {
    const translate = useTranslate();

    const names = {};

    if (projectId) {
        names[projectId] = translate("Source");
    }
    if (compilationId) {
        names[compilationId] = translate("Compilation");
    }
    for (const [index, reply] of (replies || []).entries()) {
        names[reply.id] = translate("Reply %1", index + 1);
    }

    return names;
};
