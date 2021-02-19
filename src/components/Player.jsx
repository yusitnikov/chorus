import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from "react";
import {defaultPlayerWidth, VideoHolder} from "./VideoHolder";
import {KalturaPlayer, ks} from "../misc/externals";
import {useEventListener} from "../hooks/useEventListener";
import {useAutoIncrementId} from "../hooks/useAutoIncrementId";
import {thumbnailUrl} from "../utils/thumbnailUrl";
import {EntryNotReadyScreen} from "./EntryNotReadyScreen";
import {downloadUrl} from "../utils/downloadUrl";
import {isMediaReady} from "../models/Media";

export const Player = forwardRef(({entry, onPlaybackEnded, width= defaultPlayerWidth}, playerRef) => {
    const [player, setPlayer] = useState(null);

    const containerId = "player" + useAutoIncrementId();
    const ref = useRef(null);

    const entryReady = isMediaReady(entry);
    const entryDownloadUrl = downloadUrl(entry, ks);
    const entryThumbnailUrl = thumbnailUrl(entry, defaultPlayerWidth, 1);

    useEffect(() => {
        const player = KalturaPlayer.setup({
            targetId: containerId,
            provider: {
                partnerId: process.env.REACT_APP_PARTNER_ID,
                env: {
                    serviceUrl: process.env.REACT_APP_SERVICE_URL + "/api_v3",
                    cdnUrl: process.env.REACT_APP_CDN_URL,
                },
            },
            playback: {
                autoload: false,
                preload: "auto",
            },
        });

        window.player = player;
        setPlayer(player);

        return () => player.destroy();
    }, [containerId, setPlayer]);

    useEffect(() => {
        if (!player || !entryReady) {
            return;
        }

        player.setMedia({
            sources: {
                type: "Vod",
                progressive: [
                    {
                        url: entryDownloadUrl,
                        mimetype: "video/mp4",
                    }
                ],
                poster: entryThumbnailUrl,
            }
        });
    }, [player, entryReady, entryDownloadUrl, entryThumbnailUrl]);

    useImperativeHandle(playerRef, () => ({
        play: () => {
            if (player) {
                player.currentTime = 0;
                player.play();
            }
        },
        stop: () => {
            if (player) {
                player.pause();
                player.currentTime = 0;
            }
        },
    }), [player]);

    useEventListener(player, player?.Event?.Core?.PLAYBACK_ENDED, onPlaybackEnded);

    return <VideoHolder width={width}>
        <div ref={ref} id={containerId} className={"fill"} style={{display: entryReady ? "block" : "none"}}/>

        {!entryReady && <EntryNotReadyScreen thumbnailUrl={entryThumbnailUrl}/>}
    </VideoHolder>;
});
