import {useCallback, useEffect, useMemo, useState} from "react";
import {abortablePromise} from "../misc/abortablePromise";

let autoIncrementDepsVersion = 0;

export const useLoader = (loader, deps = []) => {
    const [version, setVersion] = useState(0);
    const reload = useCallback(() => setVersion(version => version + 1), [setVersion]);
    const allDeps = [...deps, version];

    const depsVersion = useMemo(() => ++autoIncrementDepsVersion, allDeps);
    const resultPromise = useMemo(loader, allDeps);
    const isImmediatePromise = !!resultPromise.isImmediate;

    let [[data, error, loadedVersion], setDataState] = useState(() => [undefined, undefined, 0]);
    if (isImmediatePromise) {
        data = resultPromise.value;
        error = undefined;
        loadedVersion = depsVersion;
    }

    useEffect(() => {
        const promise = abortablePromise(resultPromise);

        promise
            .then(data => setDataState([data, undefined, depsVersion]))
            .catch(error => setDataState([undefined, error, depsVersion]));

        return () => promise.abort();
    }, [resultPromise, isImmediatePromise, setDataState, depsVersion]);

    return loadedVersion === depsVersion
        ? [data, error, true, reload]
        : [undefined, undefined, false, reload];
};
