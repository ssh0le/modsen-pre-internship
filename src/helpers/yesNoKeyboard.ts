import { Markup } from "telegraf";

export const yesNoKeyboard = Markup.keyboard([['Yes', 'No'], ['leave']]).oneTime().resize();