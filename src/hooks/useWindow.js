import {useEffect, useState} from "react";

export const useWindow = () => {
    const [wnd, setWnd] = useState(undefined);

    useEffect(() => setWnd(window), []);

    return wnd;
};
