import { Telegraf } from "telegraf";

import { ScheduleManager } from "@/classes/scheduleManager.js";
import { getAllSubscriptions } from "@/services/index.js";

import { makeForecast } from "./index.js";

export const restoreScheduledSubscriptions = async (bot: Telegraf, manager: ScheduleManager<string>) => {
    const subscriptions = await getAllSubscriptions();
    if (!subscriptions) return;
    subscriptions.forEach(sub => {
        const { id, time, chatId, city } = sub;
        manager.addRecurrentJob(id.toString(), time.hours, time.minutes, async () => {
            bot.telegram.sendMessage(chatId, await makeForecast(city));
        })
    });
}