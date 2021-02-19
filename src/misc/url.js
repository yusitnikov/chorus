export const urlByParts = (...parts) => "/" + parts.filter(v => v).join("/");

export const absoluteUrl = (relativeUrl = "") => `${window.location.origin}${relativeUrl}`;

export const homePageUrl = "/";

export const createProjectUrl = "/create";

export const viewProjectUrl = (projectId, entryId) => urlByParts("view", projectId, entryId !== projectId ? entryId : "");

export const mediaEmbedUrl = (entryId) => urlByParts("embed", entryId);

export const replyUrl = (projectId) => urlByParts("reply", projectId);
