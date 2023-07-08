import axios, { AxiosError } from "axios";
import { deunionize,Scenes } from "telegraf";

import { weatherActions as callbackActions,  weatherCommands as commands,weatherMessages as messages, weatherSceneName} from "@/constants/index.js";
import { createForecastMessage, createInlineKeyboard, isValidName } from "@/helpers/index.js";
import { BotContext, WeatherError } from "@/interfaces/index.js";
import { fetchWeatherForecatByCityName } from "@/services/index.js";

const repeatKeyboard = createInlineKeyboard([
    [{ text: 'Repeat', callback_data: callbackActions.repeatSearch }],
])

export const weatherScene = new Scenes.WizardScene<BotContext>(weatherSceneName,
    async (ctx) => {
        await ctx.replyWithHTML(messages.onenter);
        ctx.reply(messages.askForCity);
        ctx.wizard.next();
    },
    async (ctx) => {
        if (!ctx.message) {
            ctx.scene.leave();
            return;
        }
        const { text } = deunionize(ctx.message);
        if (text && !isValidName(text)) {
            ctx.reply(messages.wrongCityName);
            ctx.wizard.selectStep(1);
            return;
        }
        try {
            const data = await fetchWeatherForecatByCityName(text.trim());
            ctx.reply(createForecastMessage(data), { reply_markup: repeatKeyboard });
            ctx.scene.leave();
        }
        catch (e) {
            if (axios.isAxiosError(e)) {
                const error = e as AxiosError;
                if (error.response) {
                    const { message } = error.response.data as WeatherError;
                    ctx.reply(`${message.charAt(0).toUpperCase()}${message.slice(1)}`, { reply_markup: repeatKeyboard });
                } else {
                    ctx.reply(messages.fetchError, { reply_markup: repeatKeyboard });
                }
            } else {
                ctx.reply(messages.unknownError, { reply_markup: repeatKeyboard });
            }
            ctx.scene.leave();
        }
    }
)

weatherScene.command(commands.leave, async (ctx) => {
    ctx.replyWithHTML(messages.onleave);
    ctx.scene.leave();
})