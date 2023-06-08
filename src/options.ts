import { InlineKeyboardMarkup } from "telegraf/types"

export const helpOptions: InlineKeyboardMarkup = {
    inline_keyboard: [
        [{text: '/cat', callback_data: '/cat'}],
        [{text: '/dog', callback_data: '/dog'}],
        [{text: '/weather', callback_data: '/weather'}],
    ]
} 
