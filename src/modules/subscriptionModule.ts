import { BotContext } from "interfaces.js"
import { getUserByTelegramId } from "./database/database.js"
import { sceneNames } from "../scenes/index.js";

export const subscriptionService = async (ctx: BotContext) => {
    if (!ctx.session.user) {
        const user = await getUserByTelegramId(ctx.from.id);
        ctx.session.user = user;
    }
    ctx.scene.enter(sceneNames.subscription);
}