import {ks} from "../misc/externals";
import {playerAspectRatio} from "../misc/playerAspectRatio";

export const thumbnailUrl = (entry, width) => `${entry.thumbnailUrl}/width/${width}/height/${width * playerAspectRatio}/type/3/ks/${ks}`;
