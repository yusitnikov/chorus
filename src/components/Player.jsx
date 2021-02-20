import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from "react";
import {defaultPlayerWidth, VideoHolder} from "./VideoHolder";
import {useEventListener} from "../hooks/useEventListener";
import {thumbnailUrl} from "../utils/thumbnailUrl";
import {EntryNotReadyScreen} from "./EntryNotReadyScreen";
import {downloadUrl} from "../utils/downloadUrl";
import {isMediaReady} from "../models/Media";

export const Player = forwardRef(({ks, entry, onPlaybackEnded, width= defaultPlayerWidth}, playerRef) => {
    const [player, setPlayer] = useState(null);

    const containerId = "player";
    const ref = useRef(null);

    const entryReady = isMediaReady(entry);
    const entryDownloadUrl = downloadUrl(entry, ks);
    const entryThumbnailUrl = thumbnailUrl(ks, entry, defaultPlayerWidth, 1);

    useEffect(() => {
        const player = window.KalturaPlayer.setup({
            targetId: containerId,
            provider: {
                partnerId: process.env.NEXT_PUBLIC_PARTNER_ID,
                env: {
                    serviceUrl: process.env.NEXT_PUBLIC_SERVICE_URL + "/api_v3",
                    cdnUrl: process.env.NEXT_PUBLIC_CDN_URL,
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

        {!entryReady && <EntryNotReadyScreen thumbnailUrl={thumbnailUrl(ks, entry, defaultPlayerWidth, 3)}/>}
    </VideoHolder>;
});
