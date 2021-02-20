import {timeoutPromise} from "./timeoutPromise";

export class TimeoutError extends Error {
    constructor(timeout) {
        super(`Timed out after ${timeout} milliseconds`);
    }
}

export const abortablePromise = (promise, timeout = 0) => {
    if (timeout) {
        return abortablePromise(Promise.race([
            promise,
            timeoutPromise(timeout).then(() => Promise.reject(new TimeoutError(timeout)))
        ]));
    }

    if (promise.abort) {
        // The promise is already abortable, no need to hack
        return promise;
    }

    let aborted = false;
    const abortable = new Promise(async(resolve, reject) => {
        try {
            const result = await promise;
            if (!aborted) {
                resolve(result);
            }
        } catch (error) {
            if (!aborted) {
                reject(error);
            }
        }
    });
    abortable.abort = () => aborted = true;
    return abortable;
};
