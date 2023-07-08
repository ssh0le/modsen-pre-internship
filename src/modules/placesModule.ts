import { BotContext } from "@/interfaces/index.js"
import { sceneNames } from "@/scenes/index.js";

export const placesService = async (ctx: BotContext) => {
    ctx.scene.enter(sceneNames.places);
}