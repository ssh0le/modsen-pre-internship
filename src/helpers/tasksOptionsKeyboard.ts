import { Markup } from "telegraf";

import { tasksOptions } from "@/constants/index.js";

export const tasksOptionsKeyboard = Markup.keyboard([
    [tasksOptions.addTask],
    [tasksOptions.selectTask],
    [tasksOptions.leave],
]).oneTime().resize();