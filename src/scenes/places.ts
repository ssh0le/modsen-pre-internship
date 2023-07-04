import { hasResults, isIncludeType, makeTypesKeyboard, sendPlacesByPage, updateKeyword } from '@helpers/index.js';
import { BotContext } from "@interfaces/interfaces.js";
import { deunionize, Scenes } from "telegraf";

import { placesLeaveKeyboard, placesMessages, placesPerPage, placesRemoveKeyboard, placesSceneName,placeTypes } from '@/constants/index.js';
import { isValidName } from "@/helpers/isValidCityName.js";
import { fetchPlaces, getCityCoords } from "@/services/index.js";

const readCityName = async (ctx: BotContext) => {
    const { text } = deunionize(ctx.message);
    if (!isValidName(text)) {
        ctx.reply(placesMessages.invalidCity, placesLeaveKeyboard);
        ctx.wizard.selectStep(ctx.wizard.cursor - 1);
        return;
    }
    try {
        const cityCoords = await getCityCoords(text);
        if (!cityCoords) throw cityCoords;
        ctx.reply(placesMessages.askToSelectType, makeTypesKeyboard(placeTypes));
        ctx.scene.session.places = { city: text, coords: cityCoords };
    } catch (e) {
        ctx.reply(placesMessages.cityNotFound);
        ctx.wizard.selectStep(ctx.wizard.cursor - 1);
        return;
    }
}

const readPlaceType = async (ctx: BotContext) => {
    const { text } = deunionize(ctx.message);
    if (!isIncludeType(placeTypes, text)) {
        ctx.wizard.selectStep(ctx.wizard.cursor - 1);
        ctx.reply(placesMessages.wrongType);
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
        ctx.reply(placesMessages.noPlaces, placesRemoveKeyboard);
        ctx.scene.leave();
        return;
    }
    await sendPlacesByPage(ctx, results, 0, coords, placesPerPage);
    ctx.replyWithHTML(placesMessages.onleave, placesRemoveKeyboard);
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
    await ctx.reply(placesMessages.leaveHint, placesLeaveKeyboard);
    await ctx.replyWithHTML(placesMessages.onenter);
    ctx.scene.session.places = {};
})