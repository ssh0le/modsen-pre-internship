import { Markup } from "telegraf";

import { Coords } from "@/interfaces/index.js";

export const makePlaceKeyboard = (placeId: string, coords: Coords) => {
    const location = encodeURIComponent(`${coords.lat},${coords.lon}`);
    const path = `https://www.google.com/maps/search/?api=1&query=${location}&query_place_id=`;
    return Markup.inlineKeyboard([Markup.button.url('Maps', path + placeId)]);
}