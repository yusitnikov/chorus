const neverPromise = new Promise(() => {});

export const immediatePromise = (value) => (value?.then ? value : {
    isImmediate: true,
    value,
    then: (callback) => immediatePromise(callback(value)),
    catch: () => neverPromise,
    finally: (callback) => immediatePromise(callback(value)),
    abort: () => {},
});

export const waitForPossiblyImmediatePromises = (promises) => promises.every(promise => promise.isImmediate)
    ? immediatePromise(promises.map(promise => promise.value))
    : Promise.all(promises);
