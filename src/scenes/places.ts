import { BotContext, Coord as Coords, Place } from "../interfaces.js";
import { Markup, Scenes, deunionize } from "telegraf";
import { isValidName } from "../helpers/isValidCityName.js";
import { getCityCoords } from "../services/getCityCoords.js";
import { fetchPlaces } from "../services/fetchPlaces.js";
import { placeToString } from "../helpers/placeToMessage.js";
import { createInlineKeyboard } from "../helpers/createInlineKeyboard.js";

export const placesSceneName = 'PLACES';
const actions = {
    nextPage: 'NEXT_PAGE',
}

const placesPerPage = 10;
const placeTypes = ["Bar", "Restaurant", "Amusement park", "Art gallery", "Cafe", "Movie theater", "Night club", "Any type"];
const removeKeyboard = Markup.removeKeyboard();
const leaveKeyboard = Markup.keyboard([
    ['leave'],
]).oneTime().resize();
const nextPageKeyboard = createInlineKeyboard([
    [{text: 'Load more', callback_data: actions.nextPage}]
])


const makeTypesKeyboard = (types: string[]) => {
    const keyboardSchema = [];
    const columnNumber = 2;
    for (let i = 0; i < types.length; i += 2) {
        const row = [];
        for (let j = 0; j < columnNumber; j++) {
            if (types[i + j]) {
                row.push(types[i + j]);
            } else {
                continue;
            }
        }
        keyboardSchema.push(row);
    }
    return Markup.keyboard(keyboardSchema).resize().oneTime();
}

const makePlaceKeyboard = (placeId: string, coords: Coords) => {
    const location = encodeURIComponent(coords.lat + "," + coords.lon);
    const path = `https://www.google.com/maps/search/?api=1&query=${location}&query_place_id=`;
    return Markup.inlineKeyboard([Markup.button.url('Maps', path + placeId)]);
}

const sendPlacesByPage = (ctx: BotContext, list: Place[], page: number, coords: Coords) => {
    list.splice(page * placesPerPage, placesPerPage).forEach(async (place) => {
        await ctx.reply(placeToString(place), makePlaceKeyboard(place.place_id, coords));
    })
}

const readCityName = async (ctx: BotContext) => {
    const { text } = deunionize(ctx.message);
    if (!isValidName(text)) {
        ctx.reply('Not valid city name');
        ctx.wizard.selectStep(ctx.wizard.cursor - 1);
        return;
    }
    try {
        const cityCoords = await getCityCoords(text);
        if (!cityCoords) throw cityCoords;
        ctx.reply('Select type:', makeTypesKeyboard(placeTypes));
        ctx.scene.session.places = { city: text, coords: cityCoords };
    } catch (e) {
        ctx.reply('City with such name wasn\'t found, please reenter:');
        ctx.wizard.selectStep(ctx.wizard.cursor - 1);
        return;
    }
}

const readPlaceType = async (ctx: BotContext) => {
    const { text } = deunionize(ctx.message);
    if (!placeTypes.includes(text)) {
        ctx.wizard.selectStep(ctx.wizard.cursor - 1);
        ctx.reply('Please select type from given list:')
        return;
    }
    if (!ctx.scene.session.places) {
        ctx.scene.reenter();
        return;
    }
    const { city, coords } = ctx.scene.session.places;
    let keyword = '';
    if (text === 'Any type') {
        keyword = 'places of interest in ' + city;
    }
    const type = text.toLowerCase().replace(/[^\w]/, '_');
    ctx.scene.session.places.keyword = keyword;
    ctx.scene.session.places.type = type;
    const { results } = await fetchPlaces(keyword, coords, type);
    if (!results || !results.length) {
        ctx.reply('No available places of interest in this city', removeKeyboard);
        ctx.scene.leave();
        return;
    }
    sendPlacesByPage(ctx, results, 0, coords);
    ctx.replyWithHTML('Type /help for more', removeKeyboard);
    return ctx.scene.leave();
}


export const placesScene = new Scenes.WizardScene<BotContext>(
    placesSceneName,
    async (ctx) => {
        await readCityName(ctx);
        return ctx.wizard.next();
    },
    async (ctx) => {
        await readPlaceType(ctx);
        return ctx.wizard.next();
    }
);

placesScene.hears('leave', async (ctx) => {
    await ctx.replyWithHTML('You have left task service. Type /help to select another service', removeKeyboard);
    await ctx.scene.leave();
})

placesScene.enter(async ctx => {
    await ctx.reply('Enter the city name:');
    ctx.scene.session.places = {};
})