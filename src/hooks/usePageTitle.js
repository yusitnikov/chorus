import {useEffect} from "react";

export const usePageTitle = (title) => useEffect(() => {
    if (title) {
        window.document.title = `${title} - Chorus`;

        return () => window.document.title = "Chorus";
    }
}, [title]);
