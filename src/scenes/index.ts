import { Composer, Scenes } from "telegraf";
import { introduceComposer, introduceSceneName, introduceScene } from "./introduce.js";
import { weatherSceneName, weatherScene  } from "./weather.js";
import { BotContext } from "interfaces.js";
import { tasksScene } from "./tasks.js";

export const sceneNames = {
    introduce: introduceSceneName,
    weatehrSearch: weatherSceneName,
}

export const sceneComposer = new Composer();

const stage  = new Scenes.Stage<BotContext>([weatherScene, introduceScene, tasksScene])
sceneComposer.use(introduceComposer);

sceneComposer.use(stage.middleware());


