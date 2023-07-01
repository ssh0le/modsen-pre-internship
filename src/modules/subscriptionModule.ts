import { BotContext } from "@/interfaces/interfaces.js"
import { sceneNames } from "@/scenes/index.js";
import { getUserByTelegramId } from "@/services/index.js";

export const subscriptionService = async (ctx: BotContext) => {
    const user = await getUserByTelegramId(ctx.from.id);
    ctx.session.user = user;
    if (!user) {
        ctx.scene.enter(sceneNames.introduce);
    } else {
        ctx.scene.enter(sceneNames.subscription);
    }
}