import { subscriptionMessages } from "@/constants/index.js";
import { fetchWeatherForecatByCityName } from "@/services/index.js";

import { createForecastMessage } from "./index.js";

export const makeForecast = async (city: string) => {
    try {
        const data = await fetchWeatherForecatByCityName(city);
        return  `${subscriptionMessages.foreacastTitle}${createForecastMessage(data)}`;
    } catch (e) {
        return subscriptionMessages.foreacastFailed;
    }
}