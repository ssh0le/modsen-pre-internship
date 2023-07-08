import {  Composer, Scenes} from "telegraf";

import { weatherActions as callbackActions,weatherSceneName} from '@/constants/index.js'
import { BotContext,} from "@/interfaces/index.js";
import { weatherScene } from "@/scenes/weather.js";

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