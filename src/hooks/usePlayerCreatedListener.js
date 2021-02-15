import {useEventListener} from "./useEventListener";
import {KalturaPlayer} from "../misc/externals";

const eventName = "kalturaPlayerCreated";

const originalPlayerSetup = KalturaPlayer.setup.bind(KalturaPlayer);
window.KalturaPlayer = {
    ...KalturaPlayer,
    setup: (...args) => {
        const player = originalPlayerSetup(...args);
        window.dispatchEvent(new CustomEvent(eventName, {detail: {player}}));
        return player;
    },
};

export const usePlayerCreatedListener = (handler) => useEventListener(window, eventName, event => handler(event.detail.player));
