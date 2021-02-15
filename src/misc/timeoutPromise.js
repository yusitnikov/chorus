import {abortablePromise} from "./abortablePromise";

export const timeoutPromise = (timeout) => abortablePromise(new Promise((resolve) => setTimeout(resolve, timeout)));
