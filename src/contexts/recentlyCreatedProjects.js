import {createContext, useContext} from "react";

export const RecentlyCreatedProjectsContext = createContext(undefined);

export const useRecentlyCreatedProjectsContext = () => useContext(RecentlyCreatedProjectsContext);

export const useAddRecentlyCreatedProject = () => useRecentlyCreatedProjectsContext().add;
export const useIsRecentlyCreatedProject = () => useRecentlyCreatedProjectsContext().is;
