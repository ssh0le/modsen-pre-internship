import { Context, Markup } from "telegraf";

const removeKeyboard = Markup.removeKeyboard();
import { description } from "@/constants/index.js";

export const sendDescription = async (ctx: Context) => {
    await ctx.replyWithHTML(description.join('\n'), removeKeyboard);
}