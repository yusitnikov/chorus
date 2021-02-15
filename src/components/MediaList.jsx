import React from "react";
import {Link} from "react-router-dom";
import {thumbnailUrl} from "../utils/thumbnailUrl";
import {playerAspectRatio} from "../misc/playerAspectRatio";

const itemWidth = 160;
const itemHeight = itemWidth * playerAspectRatio;

export const MediaList = ({projectId, compilationId, items = [], AdditionalInfoComponent, customNameCallback}) => {
    return (
        !!items?.length && <>
            {items.map(entry => (
                <MediaListItem
                    key={entry.id}
                    projectId={projectId}
                    compilationId={compilationId}
                    entry={entry}
                    AdditionalInfoComponent={AdditionalInfoComponent && <AdditionalInfoComponent entry={entry}/>}
                    customName={customNameCallback && customNameCallback(entry)}
                />
            ))}
        </>
    );
};

const MediaListItem = ({projectId, compilationId, entry, AdditionalInfoComponent, customName}) => {
    const name = customName || entry.name;

    return (
        <Link
            to={`/view/${projectId}${entry.id !== projectId ? `/${entry.id === compilationId ? "result" : entry.id}` : ""}`}
            className={"inline-block gray-borders border-radius"}
            style={{
                width: itemWidth,
                textAlign: "center",
                textDecoration: "none",
            }}
            title={name}
        >
            <div className={"input-padding"}>
                <div className={"block single-line"}>{name}</div>
                {AdditionalInfoComponent && <div className={"block"}><AdditionalInfoComponent/></div>}
            </div>
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
