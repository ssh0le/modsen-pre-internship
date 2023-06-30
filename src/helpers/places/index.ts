import { BotContext, Coords } from "@interfaces/interfaces.js";
import { Markup } from "telegraf";
import { Place } from "@interfaces/interfaces.js";

export const isIncludeType = (types: string[], type: string) => types.includes(type);

export const hasResults = (places: Place[] | null) => {
    return !places || !places.length
}

export const updateKeyword = (placeType: string, city: string) => {
    if (placeType === 'Any type') {
        return `places of interest in ${city}`;
    }
    return '';
}

export const makeTypesKeyboard = (types: string[]) => {
    const columnNumber = 2;
    const keyboardSchema = types.reduce<string[][]>((schema, type, i) => {
        if (i % columnNumber === 0) {
            schema.push([type]);
        } else {
            schema.at(-1).push(type);
        }
        return schema;
    }, []);
    return Markup.keyboard(keyboardSchema).resize().oneTime();
}

export const makePlaceKeyboard = (placeId: string, coords: Coords) => {
    const location = encodeURIComponent(`${coords.lat},${coords.lon}`);
    const path = `https://www.google.com/maps/search/?api=1&query=${location}&query_place_id=`;
    return Markup.inlineKeyboard([Markup.button.url('Maps', path + placeId)]);
}

export const sendPlacesByPage = async (ctx: BotContext, list: Place[], page: number, coords: Coords, placesPerPage: number) => {
    const places = list.slice(page * placesPerPage, placesPerPage);
    for (let i = 0; i < places.length; i++) {
        const place = places[i];
        await ctx.reply(placeToString(place), makePlaceKeyboard(place.place_id, coords));
    }
}

const placeToString = (place: Place) => {
    let type = place.types[0].replace(/[^a-z]/gi, ' ');
    type = type.charAt(0).toUpperCase() + type.slice(1);
    return [
        type,
        `Name: ${decodeURIComponent(place.name)}`,
        `Address: ${decodeURIComponent(place.vicinity)}`,
    ].join('\n');
}
