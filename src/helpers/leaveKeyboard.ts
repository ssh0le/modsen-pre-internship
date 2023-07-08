import { Markup } from "telegraf";

export const leaveKeyboard = Markup.keyboard([
    ['leave'],
]).oneTime().resize();