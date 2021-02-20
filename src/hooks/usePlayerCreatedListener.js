import {useEffect} from "react";
import {useEventListener} from "./useEventListener";
import {useWindow} from "./useWindow";

const eventName = "kalturaPlayerCreated";

export const usePlayerCreatedListener = (handler) => {
    const wnd = useWindow();

    useEffect(() => {
        const originalPlayer = window.KalturaPlayer;
        const originalPlayerSetup = originalPlayer.setup.bind(originalPlayer);
        window.KalturaPlayer = {
            ...originalPlayer,
            setup: (...args) => {
                const player = originalPlayerSetup(...args);
                window.dispatchEvent(new CustomEvent(eventName, {detail: {player}}));
                return player;
            },
        };

        return () => window.KalturaPlayer = originalPlayer;
    }, []);

    return useEventListener(wnd, eventName, event => handler(event.detail.player));
};
