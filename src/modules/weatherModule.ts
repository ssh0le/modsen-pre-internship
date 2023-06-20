import { Context, Composer, Scenes, session, deunionize, Telegraf } from "telegraf";
import { BotContext, WeatherError } from "interfaces.js";
import { getWeatherScene, callbackActions } from "../scenes/weather.js";

const SEARCH_SCENE_NAME = 'WEATHER_SEARCH'



const stage = new Scenes.Stage([getWeatherScene(SEARCH_SCENE_NAME)]);
export const weatherComposer = new Composer();
weatherComposer.use(session());
weatherComposer.use(stage.middleware());

weatherComposer.action(callbackActions.repeatSearch, async (ctx) => {
    ctx.answerCbQuery();
    weatherService(ctx);
})

weatherComposer.action(callbackActions.leaveSearch, async (ctx) => {
    ctx.answerCbQuery();
    if (ctx.scene) {
        ctx.reply('You are out of the weather search')
        ctx.scene.leave();
    }
})


export const weatherService = async (ctx: BotContext) => {
    ctx.scene.enter(SEARCH_SCENE_NAME);
}