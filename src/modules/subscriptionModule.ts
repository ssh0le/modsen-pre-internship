import { BotContext } from "interfaces.js"
import { sceneNames } from "../scenes/index.js";

export const subscriptionService = async (ctx: BotContext) => {
    ctx.scene.enter(sceneNames.subscription);
}