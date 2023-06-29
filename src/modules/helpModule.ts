import { Context, Markup } from "telegraf";

const removeKeyboard = Markup.removeKeyboard();

export const sendDescription = async (ctx: Context) => {
    await ctx.replyWithHTML([
        'These are my services:',
        '/cat - Random cat photo',
        '/dog - Random dog photo',
        '/weather - Weather service',
        '/tasks - Tasks service',
        '/subscription - Weather foreacast subscription service',
        '/places - Places of interest service',
    ].join('\n'), removeKeyboard);
}