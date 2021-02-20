import {createContext, useContext} from "react";

export const AppContext = createContext(undefined);

export const useAppContext = () => useContext(AppContext);

export const useIsHead = () => useAppContext().isHead;
export const useLocaleCode = () => useAppContext().localeCode;
export const useTranslate = () => useAppContext().translate;
export const useTranslateWithContext = () => useAppContext().translateWithContext;
export const useTranslatePlural = () => useAppContext().translatePlural;
