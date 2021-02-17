import {loadMediaList} from "./Media";
import {useLoader} from "../hooks/useLoader";
import {immediatePromise} from "../misc/immediatePromise";
import {translate} from "../locales/translate";

export const projectAdminTag = "chorus";

export const getProjectIdByEntry = (entry) => entry.parentEntryId || entry.id;

export const isProjectSourceEntry = (source) => source.adminTags && source.adminTags.indexOf(projectAdminTag) >= 0;

export const getProjectCompilationId = (sourceEntry) => sourceEntry.referenceId;

export const loadProjectReplies = async(source, useCache = false) => await loadMediaList(
    {
        parentEntryIdEqual: source.id,
        idNotIn: getProjectCompilationId(source) || undefined,
    },
    useCache
);
export const useLoadProjectReplies = (source) => useLoader(
    () => source ? loadProjectReplies(source, true) : immediatePromise(undefined),
    [source]
);

export const getProjectEntryNamesMap = (projectId, compilationId, replies) => {
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
