import { Composer, Scenes } from "telegraf";
import { introduceComposer, introduceSceneName, introduceScene } from "./introduce.js";
import { weatherSceneName, weatherScene  } from "./weather.js";
import { subscriptionScene, subscriptionSceneName } from "./subscription.js";
import { BotContext } from "interfaces.js";
import { tasksScene, tasksSceneName } from "./tasks.js";

export const sceneNames = {
    introduce: introduceSceneName,
    weatehrSearch: weatherSceneName,
    subscription: subscriptionSceneName,
    tasks: tasksSceneName,
}

export const sceneComposer = new Composer();

const stage  = new Scenes.Stage<BotContext>([weatherScene, introduceScene, tasksScene, subscriptionScene])
sceneComposer.use(introduceComposer);

sceneComposer.use(stage.middleware());


