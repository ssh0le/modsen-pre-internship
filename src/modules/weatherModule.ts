import { Context, Composer, Scenes, session, deunionize, Telegraf, NarrowedContext } from "telegraf";
import { BotContext, WeatherError } from "interfaces.js";
import { weatherScene, callbackActions, weatherSceneName } from "../scenes/weather.js";
import { CallbackQuery, Update } from "telegraf/types";
import { Stage } from "telegraf/scenes";


const stage = new Scenes.Stage<BotContext>([weatherScene]);

export const weatherComposer = new Composer();
weatherComposer.use(stage.middleware());

weatherComposer.action(callbackActions.repeatSearch, async (ctx) => {
    ctx.answerCbQuery();
    weatherService(ctx);
})


export const weatherService = async (ctx) => {
    ctx.scene.enter(weatherSceneName);
}