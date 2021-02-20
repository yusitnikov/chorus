import React from "react";
import {thumbnailUrl} from "../utils/thumbnailUrl";
import {playerAspectRatio} from "../misc/playerAspectRatio";
import {viewProjectUrl} from "../misc/url";
import {InlineBlocksHolder} from "./InlineBlocksHolder";
import Link from "next/link";

const itemWidth = 160;
const itemHeight = itemWidth * playerAspectRatio;

export const MediaList = ({ks, projectId, items = [], AdditionalInfoComponent, nameCallback, urlCallback}) => {
    return (
        !!items?.length && <InlineBlocksHolder>
            {items.map(entry => (
                <MediaListItem
                    key={entry.id}
                    ks={ks}
                    projectId={projectId}
                    entry={entry}
                    AdditionalInfoComponent={AdditionalInfoComponent && <AdditionalInfoComponent entry={entry}/>}
                    name={nameCallback && nameCallback(entry)}
                    url={urlCallback && urlCallback(entry)}
                />
            ))}
        </InlineBlocksHolder>
    );
};

export const MediaListItem = ({
    ks,
    projectId,
    entry,
    AdditionalInfoComponent,
    name,
    url = viewProjectUrl(projectId, entry.id),
    openInNewPage = false,
}) => {
    return (
        <Link href={url}>
            <a
                className={"inline-block gray-borders border-radius"}
                style={{
                    width: itemWidth,
                    textAlign: "center",
                    textDecoration: "none",
                }}
                title={name}
                target={openInNewPage ? "_blank" : undefined}
            >
                {(name || AdditionalInfoComponent) && <div className={"input-padding"}>
                    <div className={"block single-line"}>{name}</div>
                    {AdditionalInfoComponent && <div className={"block"}><AdditionalInfoComponent/></div>}
                </div>}
                <img
                    className={"block"}
                    src={thumbnailUrl(ks, entry, itemWidth)}
                    style={{
                        margin: 0,
                        width: itemWidth,
                        height: itemHeight,
                    }}
                    alt={name}
                />
            </a>
        </Link>
    );
};
