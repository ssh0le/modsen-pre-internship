import axios, { AxiosError } from "axios";
import { createForecastMessage } from "../helpers/createForeacastMessage.js";
import { createInlineKeyboard } from "../helpers/createInlineKeyboard.js";
import { isValidCityName } from "../helpers/isValidCityName.js";
import { WeatherError } from "../interfaces.js";
import { fetchWeatherForecatByCityName } from "../services/fetchWeather.js";
import { Scenes, deunionize } from "telegraf";

export const callbackActions = {
    repeatSearch: 'REPEAT_SEARCH',
    leaveSearch: 'LEAVE_SEARCH',
}

const WRONG_NAME_MESSAGE = 'Wrong city name format. Please repeat:';
const FETCHING_ERROR = 'Something went wrong during fetching weather.';
const ENTER_NAME_MESSAGE = 'Please, enter a city name:';
const UNKNOWN_ERROR_MESSAGE = 'Unknown error';

const repeatKeyboard = createInlineKeyboard([
    [{ text: 'Repeat', callback_data: callbackActions.repeatSearch }],
])

const leaveSceneKeyboard = createInlineKeyboard([
    [{ text: 'Leave', callback_data: callbackActions.leaveSearch }]
])

export const getWeatherScene = (name: string) => new Scenes.WizardScene(name, (ctx) => {
    ctx.reply(ENTER_NAME_MESSAGE, { reply_markup: leaveSceneKeyboard });
    ctx.wizard.next();
},
    async (ctx) => {
        if (!ctx.message) {
            ctx.scene.leave();
            return;
        }
        const { text } = deunionize(ctx.message);
        if (text && !isValidCityName(text)) {
            ctx.reply(WRONG_NAME_MESSAGE, { reply_markup: leaveSceneKeyboard });
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
