import {useEffect, useState} from "react";

export const useScopedPromise = () => {
    const [promise, setPromise] = useState(null);

    // Abort the promise when it goes out of the scope
    useEffect(() => {
        return () => promise?.abort();
    }, [promise]);

    return [promise, setPromise];
};
