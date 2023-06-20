import axios from "axios";
import { Weather } from "interfaces.js";
import * as dotenv from 'dotenv'


dotenv.config();

const apiUrl = process.env.WEATHER_API_URL as string;

export const fetchWeatherForecatByCityName = async (name: string) => {
    const {data} = await axios.get<Weather>(apiUrl + new URLSearchParams({ q: name }));
    return data;
}