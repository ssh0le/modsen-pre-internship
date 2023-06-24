import { BotContext } from "interfaces.js"
import { getUserByTelegramId } from "./database/database.js"
import { sceneNames } from "../scenes/index.js";

export const taskService = async (ctx: BotContext) => { 
    const user = await getUserByTelegramId(ctx.from.id);
    ctx.session.user = user;
    if (!user) {
        ctx.scene.enter(sceneNames.introduce);
    } else {
        ctx.scene.enter(sceneNames.tasks);
    }
}