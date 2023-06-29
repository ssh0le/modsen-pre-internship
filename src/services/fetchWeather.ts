import { weatherApiUrl } from "@/config.js";
import axios from "axios";
import { Weather } from "@/interfaces/interfaces.js";

export const fetchWeatherForecatByCityName = async (name: string) => {
    const {data} = await axios.get<Weather>(weatherApiUrl + new URLSearchParams({ q: name }));
    return data;
}