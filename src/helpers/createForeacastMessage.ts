import { Weather } from "@/interfaces/index.js";


export const createForecastMessage = (data: Weather) : string => {
    const {name, main, sys, wind,weather} = data;
    return [
        `City: ${name}`,
        `Country code: ${sys.country}`,
        `Temperature: ${Math.ceil(main.temp)}°C`,
        `Weather: ${weather[0].description}`, 
        `Feels like: ${Math.ceil(main.feels_like)}°C`,
        `Wind: ${wind.speed.toFixed(1)} km/h`,
    ].join('\n')
}