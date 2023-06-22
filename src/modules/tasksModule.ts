import { BotContext } from "interfaces.js"
import { getUserByTelegramId } from "./database/database.js"
import { Composer, Scenes, session } from "telegraf";
import { introduceScene, introduceComposer, introduceSceneName } from "../scenes/introduce.js";
import { tasksSceneName } from "../scenes/tasks.js";


export const tasksComposer = new Composer();

export const taskService = async (ctx: BotContext) => { 
    const user = await getUserByTelegramId(ctx.from.id);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ctx.session.user = user;
    if (!user) {
        ctx.scene.enter(introduceSceneName);
    } else {
        ctx.scene.enter(tasksSceneName);
    }
}