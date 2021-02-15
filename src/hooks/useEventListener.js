import {useEffect, useRef} from "react";

export const useEventListener = (object, eventName, handler) => {
    const handlerRef = useRef({}).current;
    handlerRef.handle = handler;

    useEffect(() => {
        if (!object) {
            return;
        }

        object.addEventListener(eventName, (...args) => handlerRef.handle && handlerRef.handle(...args));
    }, [object]);
};
