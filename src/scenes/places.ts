import { BotContext } from "@interfaces/interfaces.js";
import { Markup, Scenes, deunionize } from "telegraf";
import { isValidName } from "@/helpers/isValidCityName.js";
import { hasResults, isIncludeType, makeTypesKeyboard, sendPlacesByPage, updateKeyword } from '@helpers/index.js';
import { fetchPlaces, getCityCoords } from "@/services/index.js";


export const placesSceneName = 'PLACES';

const messages = {
    leaveHint: 'Type /leave to leave from service',
    onenter: 'Enter the city name:',
    onleave: 'Type /help for more',
    noPlaces: 'No available places of interest in this city',
    invalidCity: 'Not valid city name',
    askToSelectType: 'Select type:',
    wrongType: 'Please select type from given list:',
    cityNotFound: 'City with such name wasn\'t found, please reenter:',
}

const placesPerPage = 10;
const placeTypes = ["Bar", "Restaurant", "Amusement park", "Art gallery", "Cafe", "Movie theater", "Night club", "Any type"];

const removeKeyboard = Markup.removeKeyboard();
const leaveKeyboard = Markup.keyboard([
    ['leave'],
]).oneTime().resize();

const readCityName = async (ctx: BotContext) => {
    const { text } = deunionize(ctx.message);
    if (!isValidName(text)) {
        ctx.reply(messages.invalidCity, leaveKeyboard);
        ctx.wizard.selectStep(ctx.wizard.cursor - 1);
        return;
    }
    try {
        const cityCoords = await getCityCoords(text);
        if (!cityCoords) throw cityCoords;
        ctx.reply(messages.askToSelectType, makeTypesKeyboard(placeTypes));
        ctx.scene.session.places = { city: text, coords: cityCoords };
    } catch (e) {
        ctx.reply(messages.cityNotFound);
        ctx.wizard.selectStep(ctx.wizard.cursor - 1);
        return;
    }
}

const readPlaceType = async (ctx: BotContext) => {
    const { text } = deunionize(ctx.message);
    if (!isIncludeType(placeTypes, text)) {
        ctx.wizard.selectStep(ctx.wizard.cursor - 1);
        ctx.reply(messages.wrongType);
        return;
    }
    if (!ctx.scene.session.places) {
        ctx.scene.reenter();
        return;
    }
    const { city, coords } = ctx.scene.session.places;
    const keyword = updateKeyword(text, city);

    // RegExp below convert spaces to '_'. Example: 'amusement park' => 'amusement_park' 
    const type = text.toLowerCase().replace(/[^\w]/, '_');
    ctx.scene.session.places.keyword = keyword;
    ctx.scene.session.places.type = type;
    const { results } = await fetchPlaces(keyword, coords, type);
    if (hasResults(results)) {
        ctx.reply(messages.noPlaces, removeKeyboard);
        ctx.scene.leave();
        return;
    }
    await sendPlacesByPage(ctx, results, 0, coords, placesPerPage);
    ctx.replyWithHTML(messages.onleave, removeKeyboard);
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

placesScene.enter(async ctx => {
    await ctx.reply(messages.leaveHint, leaveKeyboard);
    await ctx.replyWithHTML(messages.onenter);
    ctx.scene.session.places = {};
})