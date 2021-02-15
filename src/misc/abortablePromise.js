export const abortablePromise = (promise) => {
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
