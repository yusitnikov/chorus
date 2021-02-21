import Memcached from "memcached";
import {abortablePromise} from "../misc/abortablePromise";

// noinspection JSCheckFunctionSignatures
const memcached = new Memcached("localhost", {});

const abortTimeout = 100; // milliseconds
export const cacheDefaultLifeTime = 86400; // seconds

const promisifyMemcachedCall = (callback, defaultValue = undefined) => abortablePromise(
    new Promise((resolve, reject) => callback((error, data) => error ? reject(error) : resolve(data))),
    abortTimeout
).catch(() => defaultValue);

export const cacheFlush = () => promisifyMemcachedCall(callback => memcached.flush(callback));

export const cacheGet = async(key) => {
    const result = await promisifyMemcachedCall(callback => memcached.get(key, callback));
    console.log(`${Date.now()} CACHE GET ${result ? "HIT" : "MISS"} ${key}`);
    return result;
};

export const cacheSet = (key, value, lifetime = cacheDefaultLifeTime) => {
    console.log(`${Date.now()} CACHE SET ${key}`);
    return promisifyMemcachedCall(callback => memcached.set(key, value, lifetime, callback));
};

export const cacheAdd = (key, value, lifetime = cacheDefaultLifeTime) => {
    console.log(`${Date.now()} CACHE ADD ${key}`);
    return promisifyMemcachedCall(callback => memcached.set(key, value, lifetime, callback));
};

export const cacheRemove = (key) => {
    console.log(`${Date.now()} CACHE DEL ${key}`);
    return promisifyMemcachedCall(callback => memcached.del(key, callback));
};

export const cacheGetOrCalc = async(key, calculationCallback, waitForCacheSet = true, lifetime = cacheDefaultLifeTime) => {
    const resultFromCache = await cacheGet(key);
    if (resultFromCache) {
        return resultFromCache;
    }

    let calculatedResult = calculationCallback();
    if (calculatedResult?.then) {
        calculatedResult = await calculatedResult;
    }

    if (calculatedResult) {
        const cacheSetPromise = cacheSet(key, calculatedResult, lifetime);
        if (waitForCacheSet) {
            await cacheSetPromise;
        }
    }

    return calculatedResult;
};

const cacheTagGetKey = (key) => `tag:${key}`;

export const cacheGetTag = async(key, lifetime = cacheDefaultLifeTime) => {
    const tagKey = cacheTagGetKey(key);
    const newTagValue = `[${tagKey}:${Math.random().toFixed(6)}]`;
    await cacheAdd(key, newTagValue, lifetime);
    return await cacheGet(key) || newTagValue;
};

export const cacheRemoveTag = (key) => cacheRemove(cacheTagGetKey(key));
