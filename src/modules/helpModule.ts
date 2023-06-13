import { Context } from "telegraf";

export const sendDescription = async (ctx: Context) => {
    try {
        ctx.replyWithHTML([
            'What can i propose for you:',
            '/cat - Random cat photo',
            '/dog - Random dog photo',
            '/weather - Weather service',
        ].join('\n'));

    } catch (e) {
        ctx.reply('Unexpected error',);
    }
}