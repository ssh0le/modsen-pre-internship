import { Context } from "telegraf";

export const sendDescription = async (ctx: Context) => {
    try {
        ctx.replyWithHTML([
            'These are my services:',
            '/cat - Random cat photo',
            '/dog - Random dog photo',
            '/weather - Weather service',
            '/tasks - Tasks service',
        ].join('\n'));

    } catch (e) {
        ctx.reply('Unexpected error',);
    }
}