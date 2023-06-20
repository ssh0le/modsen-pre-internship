import { Context, Scenes, Telegraf } from "telegraf";

export interface BotContext extends Context {
    scene: Scenes.SceneContextScene<any, Scenes.WizardSessionData>,
    state: object,
}

export type Bot = Telegraf<BotContext>; 

export interface CatPhoto {
    id: string,
    url: string,
}

export interface DogPhoto {
    message: string,
    status: string,
}

export interface Weather {
    coord: Coord
    weather: Description[]
    main: Main
    wind: Wind
    name: string
    cod: number
    sys: Sys
}

export interface Coord {
    lon: number
    lat: number
}

export interface Description {
    main: string
    description: string
}

export interface Main {
    temp: number
    feels_like: number
    pressure: number
    humidity: number
}

export interface Wind {
    speed: number
    deg: number
    gust: number
}

export interface Sys {
    country: string
}

export interface WeatherError {
    cod: string,
    message: string,
}

export interface DBUser {
    id: string,
    telegramId: string,
    city: string,
}