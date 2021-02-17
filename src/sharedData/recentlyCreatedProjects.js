const recentlyCreatedProjects = {};

export const addRecentlyCreatedProject = (projectId) => recentlyCreatedProjects[projectId] = true;

export const isRecentlyCreatedProject = (projectId) => !!recentlyCreatedProjects[projectId];
