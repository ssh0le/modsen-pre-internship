import { Context, Markup } from "telegraf";

const removeKeyboard = Markup.removeKeyboard();
import { commandsDescription } from "@/constants/index.js";

export const sendDescription = async (ctx: Context) => {
    await ctx.replyWithHTML(commandsDescription.join('\n'), removeKeyboard);
}