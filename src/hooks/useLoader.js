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

    let [[data, loadedVersion], setDataState] = useState(() => [undefined, 0]);
    if (isImmediatePromise) {
        data = resultPromise.value;
        loadedVersion = depsVersion;
    }

    useEffect(() => {
        const promise = abortablePromise(resultPromise);

        promise.then(data => setDataState([data, depsVersion]));

        return () => promise.abort();
    }, [resultPromise, isImmediatePromise, setDataState, depsVersion]);

    return loadedVersion === depsVersion
        ? [data, true, reload]
        : [undefined, false, reload];
};
