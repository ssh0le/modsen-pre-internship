import axios, { AxiosError } from "axios";
import { createForecastMessage } from "../helpers/createForeacastMessage.js";
import { createInlineKeyboard } from "../helpers/createInlineKeyboard.js";
import { isValidName } from "../helpers/isValidCityName.js";
import { BotContext, WeatherError } from "../interfaces.js";
import { fetchWeatherForecatByCityName } from "../services/fetchWeather.js";
import { Scenes, deunionize } from "telegraf";

export const callbackActions = {
    repeatSearch: 'REPEAT_SEARCH',
    leaveSearch: 'LEAVE_SEARCH',
}

export const weatherSceneName = 'WEATHER_SEARCH'

const WRONG_NAME_MESSAGE = 'Wrong city name format. Please repeat:';
const FETCHING_ERROR = 'Something went wrong during fetching weather.';
const ENTER_NAME_MESSAGE = 'Please, enter a city name:';
const UNKNOWN_ERROR_MESSAGE = 'Unknown error';

const repeatKeyboard = createInlineKeyboard([
    [{ text: 'Repeat', callback_data: callbackActions.repeatSearch }],
])

export const weatherScene = new Scenes.WizardScene<BotContext>(weatherSceneName, (ctx) => {
    ctx.reply(ENTER_NAME_MESSAGE);
    ctx.wizard.next();
},
    async (ctx) => {
        if (!ctx.message) {
            ctx.scene.leave();
            return;
        }
        const { text } = deunionize(ctx.message);
        if (text === 'leave') {
            ctx.scene.leave();
            ctx.reply('You are out of the weather search');
            return;
        }
        if (text && !isValidName(text)) {
            ctx.reply(WRONG_NAME_MESSAGE);
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
                    ctx.reply(message.charAt(0).toUpperCase() + message.slice(1), { reply_markup: repeatKeyboard });
                } else {
                    ctx.reply(FETCHING_ERROR, { reply_markup: repeatKeyboard });
                }
            } else {
                ctx.reply(UNKNOWN_ERROR_MESSAGE, { reply_markup: repeatKeyboard });
            }
            ctx.scene.leave();
        }
    })
