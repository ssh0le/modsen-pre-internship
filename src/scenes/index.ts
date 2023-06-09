import { Composer, Scenes } from "telegraf";
import { introduceComposer, introduceSceneName, introduceScene } from "./introduce.js";
import { weatherSceneName, weatherScene  } from "./weather.js";
import { subscriptionScene, subscriptionSceneName } from "./subscription.js";
import { BotContext } from "interfaces.js";
import { tasksScene, tasksSceneName } from "./tasks.js";
import { sendDescription } from '../modules/helpModule.js';
import { placesSceneName, placesScene } from "./places.js";

export const sceneNames = {
    introduce: introduceSceneName,
    weatehrSearch: weatherSceneName,
    subscription: subscriptionSceneName,
    tasks: tasksSceneName,
    places: placesSceneName
}

export const sceneComposer = new Composer();

const stage  = new Scenes.Stage<BotContext>([weatherScene, introduceScene, tasksScene, subscriptionScene, placesScene]);

stage.hears('leave', async (ctx) => {
    await ctx.scene.leave();
    await sendDescription(ctx);
})

sceneComposer.use(introduceComposer);
sceneComposer.use(stage.middleware());