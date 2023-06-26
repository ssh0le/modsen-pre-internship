import { Context, Markup } from "telegraf";

const removeKeyboard = Markup.removeKeyboard();

export const sendDescription = async (ctx: Context) => {
    try {
        ctx.replyWithHTML([
            'These are my services:',
            '/cat - Random cat photo',
            '/dog - Random dog photo',
            '/weather - Weather service',
            '/tasks - Tasks service',
            '/subscription - Weather foreacast subscription service',
            '/places - Places of interests service',
        ].join('\n'), removeKeyboard);

    } catch (e) {
        ctx.reply('Unexpected error', removeKeyboard);
    }
}