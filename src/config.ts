import * as dotenv from 'dotenv';

dotenv.config();

export const placesApiUrl = process.env.PLACES_API_URL;
export const catApiUrl = process.env.CAT_API_URL;
export const dogApiUrl = process.env.DOG_API_URL;
export const weatherApiUrl = process.env.WEATHER_API_URL;
export const geocodingApiUrl = process.env.GEOCODING_API_URL;
export const dbUrl = process.env.DB_URL;
export const botToken = process.env.TELEGRAM_API_TOKEN;