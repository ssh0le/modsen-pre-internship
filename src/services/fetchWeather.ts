import axios from "axios";

import { weatherApiUrl } from "@/config.js";
import { Weather } from "@/interfaces/index.js";

export const fetchWeatherForecatByCityName = async (name: string) => {
    const {data} = await axios.get<Weather>(weatherApiUrl + new URLSearchParams({ q: name }));
    return data;
}