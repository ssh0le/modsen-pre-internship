import { InlineKeyboardButton, InlineKeyboardMarkup } from "telegraf/types"
 

export const createInlineKeyboard = (keys: InlineKeyboardButton[][]): InlineKeyboardMarkup => {
    return {
        inline_keyboard: keys,
    }
}


