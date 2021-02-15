import {useCallback, useState} from "react";
import {applyStateAction} from "./applyStateAction";

// Important: initialState should contain all fields that the object could potentially have!
export const useObjectState = (initialState) => {
    // useState() guarantees that the fields order will be the same each render
    const [keys] = useState(() => Object.keys(initialState));

    const [objectState, setObjectState] = useState(initialState);

    const mergeObjectState = useCallback((objectStateAction) => setObjectState((prevObjectState) => {
        const objectStateUpdates = applyStateAction(objectStateAction, prevObjectState);
        return objectStateUpdates ? {...prevObjectState, ...objectStateUpdates} : prevObjectState;
    }), [setObjectState]);

    const result = {...objectState};

    // eslint-disable-next-line
    keys.forEach(key => result["set" + key[0].toUpperCase() + key.substring(1)] = useCallback(
        (fieldStateAction) => mergeObjectState((prevFieldState) => {
            const newFieldState = applyStateAction(fieldStateAction, prevFieldState[key], true);
            return newFieldState && {[key]: newFieldState};
        }),
        [mergeObjectState]
    ));

    return [result, mergeObjectState];
};
