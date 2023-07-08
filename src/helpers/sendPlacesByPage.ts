import { BotContext, Coords, Place } from "@/interfaces/index.js";

import { makePlaceKeyboard, placeToString } from "./index.js";

export const sendPlacesByPage = async (ctx: BotContext, list: Place[], page: number, coords: Coords, placesPerPage: number) => {
    const places = list.slice(page * placesPerPage, placesPerPage);
    for (let i = 0; i < places.length; i++) {
        const place = places[i];
        await ctx.reply(placeToString(place), makePlaceKeyboard(place.place_id, coords));
    }
}