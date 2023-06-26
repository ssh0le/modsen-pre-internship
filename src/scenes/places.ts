import { BotContext, Place } from "../interfaces.js";
import { Markup, Scenes, deunionize } from "telegraf";
import { isValidName } from "../helpers/isValidCityName.js";
import { getCityCoords } from "../services/getCityCoords.js";
import { fetchPlaces } from "../services/fetchPlaces.js";
import { placeToString } from "../helpers/placeToMessage.js";

export const placesSceneName = 'PLACES'

const placeTypes = ["Bar", "Restaurant", "Amusement park", "Art gallery", "Cafe", "Movie theater", "Night club", "Any type"];

const makeTypesKeyboard = (types: string[]) => {
    const keyboardSchema = [];
    const columnNumber = 2;
    for (let i = 0; i < Math.ceil(types.length / columnNumber); i += columnNumber) {
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
    return Markup.keyboard(keyboardSchema);
}

const makeLinkButton = (placeId: string) => {
    const path = 'https://maps.googleapis.com/maps/api/place/details/json?place_id=';
    return Markup.inlineKeyboard([Markup.button.url('Link', path + placeId)])
}

const removeKeyboard = Markup.removeKeyboard();

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
        ctx.scene.session.places = {city: text, coords: cityCoords};
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
    const {city, coords} = ctx.scene.session.places;
    let keyword = '';
    if (text === 'Any type') {
        keyword = 'places of interests in '
    }
    const places = await fetchPlaces(keyword + city, coords, text);
    if (!places || !places.results.length) {
        ctx.reply('No available places of interests in this city', removeKeyboard);
        return;
    }
    ctx.reply('Places:', removeKeyboard);
    places.results.forEach(place => {
        ctx.reply(placeToString(place), makeLinkButton(place.place_id));
    })
}


export const placesScene = new Scenes.WizardScene<BotContext>(
    placesSceneName,
    async (ctx) => {
        await readCityName(ctx);
        return ctx.wizard.next();
    },
    async (ctx) => {
        await readCityName(ctx);
        return ctx.wizard.next();
    },
    async (ctx) => {
        await readPlaceType(ctx);
        return ctx.wizard.next();
    },
    async (ctx) => {
        await ctx.scene.reenter();
    }
);

placesScene.hears('leave', async (ctx) => {
    await ctx.replyWithHTML('You have left task service. Type /help to select another service', removeKeyboard);
    await ctx.scene.leave();
})

placesScene.enter(async ctx => {
    await ctx.reply('Enter the city name:');
})