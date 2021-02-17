import React from "react";
import {Link} from "react-router-dom";
import {thumbnailUrl} from "../utils/thumbnailUrl";
import {playerAspectRatio} from "../misc/playerAspectRatio";
import {viewProjectUrl} from "../misc/url";

const itemWidth = 160;
const itemHeight = itemWidth * playerAspectRatio;

export const MediaList = ({projectId, items = [], AdditionalInfoComponent, nameCallback, urlCallback}) => {
    return (
        !!items?.length && <>
            {items.map(entry => (
                <MediaListItem
                    key={entry.id}
                    projectId={projectId}
                    entry={entry}
                    AdditionalInfoComponent={AdditionalInfoComponent && <AdditionalInfoComponent entry={entry}/>}
                    name={nameCallback && nameCallback(entry)}
                    url={urlCallback && urlCallback(entry)}
                />
            ))}
        </>
    );
};

export const MediaListItem = ({
    projectId,
    entry,
    AdditionalInfoComponent,
    name,
    url = viewProjectUrl(projectId, entry.id),
    openInNewPage = false,
}) => {
    return (
        <Link
            to={url}
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
                src={thumbnailUrl(entry, itemWidth)}
                style={{
                    margin: 0,
                    width: itemWidth,
                    height: itemHeight,
                }}
                alt={name}
            />
        </Link>
    );
};
