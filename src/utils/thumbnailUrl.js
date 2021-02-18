import {ks} from "../misc/externals";
import {playerAspectRatio} from "../misc/playerAspectRatio";

export const thumbnailUrl = (entry, width, type = 3) => `${entry.thumbnailUrl}/width/${width}/height/${width * playerAspectRatio}/type/${type}/ks/${ks}`;
