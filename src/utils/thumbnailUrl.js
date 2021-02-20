import {playerAspectRatio} from "../misc/playerAspectRatio";

export const thumbnailUrl = (ks, entry, width = 0, type = 3) => `${entry.thumbnailUrl}/width/${width}/height/${width * playerAspectRatio}/type/${type}/ks/${ks}`;
