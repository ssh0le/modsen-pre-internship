import { BotContext } from "interfaces.js"
import { getUserByTelegramId } from "./database/database.js"
import { Composer, Scenes, session } from "telegraf";
import { introduceScene, introduceComposer, introduceSceneName } from "../scenes/introduce.js";


export const tasksComposer = new Composer();

export const taskService = async (ctx: BotContext) => {
    const user = await getUserByTelegramId(ctx.from.id);
    if (!user) {
        ctx.scene.enter(introduceSceneName);
    } else {
        ctx.reply('Hello, ' + user.name);
        console.log(user);
    }
}