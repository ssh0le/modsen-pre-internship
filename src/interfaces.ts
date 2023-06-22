import { ObjectId } from "mongoose";
import { Context, Scenes, Telegraf } from "telegraf";
import { Update } from "telegraf/types";

interface CustomSessionData extends Scenes.WizardSessionData{
    newTask: {
        description?: string,
        date?: Date,
    },
}

export interface BotContext <U extends Update = Update> extends Context<U> {
    session: any;
    scene: Scenes.SceneContextScene<BotContext, CustomSessionData>,
    wizard: Scenes.WizardContextWizard<BotContext>;
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
    _id: ObjectId,
    telegramId: string,
    name: string,
    city: string,
}

export interface DBTask {
    _id: ObjectId,
    description: string,
    userId: string,
    date: Date, 
}