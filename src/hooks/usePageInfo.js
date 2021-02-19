import {useEffect} from "react";
import {absoluteUrl} from "../misc/url";

const defaultTitle = "Chorus";
const defaultImage = absoluteUrl("/favicon.png");

const setMetaHeader = (name, value) => window.document
    .querySelector(`meta[property="og:${name}"]`)
    .setAttribute("content", value);

const setPageInfo = (title = defaultTitle, image = defaultImage) => {
    window.document.title = title;
    setMetaHeader("title", title);
    setMetaHeader("image", image);
}

export const usePageInfo = (title, image) => useEffect(() => {
    setPageInfo(title && `${title} - Chorus`, image);

    return () => setPageInfo();
}, [title, image]);
