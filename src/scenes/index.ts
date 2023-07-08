import { Composer, Scenes } from "telegraf";

import { introduceSceneName, placesSceneName, subscriptionSceneName, tasksSceneName,weatherSceneName } from "@/constants/index.js";
import { BotContext } from "@/interfaces/index.js";
import { sendDescription } from '@/modules/helpModule.js';

import { introduceComposer, introduceScene } from "./introduce.js";
import { placesScene } from "./places.js";
import { subscriptionScene } from "./subscription.js";
import { tasksScene} from "./tasks.js";
import { weatherScene } from "./weather.js";
export * from './subscription.js'

export const sceneNames = {
    introduce: introduceSceneName,
    weatehrSearch: weatherSceneName,
    subscription: subscriptionSceneName,
    tasks: tasksSceneName,
    places: placesSceneName
}

const commands = {
    leave: 'leave',
}

export const sceneComposer = new Composer();

const stage  = new Scenes.Stage<BotContext>([weatherScene, introduceScene, tasksScene, subscriptionScene, placesScene]);

stage.hears(commands.leave, async (ctx) => {
    await ctx.scene.leave();
    await sendDescription(ctx);
})

stage.command(commands.leave, async (ctx) => {
    await ctx.scene.leave();
    await sendDescription(ctx);
})

sceneComposer.use(introduceComposer);
sceneComposer.use(stage.middleware());