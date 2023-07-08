import { Markup } from "telegraf";

import { tasksOptions } from "@/constants/index.js";

export const tasksMenuKeyboard = Markup.keyboard([
    [tasksOptions.menu],
]).oneTime().resize();