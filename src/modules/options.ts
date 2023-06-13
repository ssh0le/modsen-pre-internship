import { InlineKeyboardMarkup } from "telegraf/types"
import { Composer } from 'telegraf'
import { sendCatPhoto } from "./catModule.js";

export const optionComposer = new Composer();

export const helpOptions: InlineKeyboardMarkup = {
    inline_keyboard: [
        [{ text: '/cat', callback_data: '/cat' }],
        [{ text: '/dog', callback_data: '/dog' }],
        [{ text: '/weather', callback_data: '/weather' }],
    ]
}

optionComposer.action('/cat', async (ctx) => {
    console.log('cat action')
    sendCatPhoto(ctx);
});
