import {useEffect} from "react";
import {useRouter} from "next/router";

export const useRedirect = (url) => {
    const router = useRouter();

    useEffect(() => {
        if (url) {
            router.replace(url);
        }
    }, [url]);
};
