export * from './weather.interface.js'
export * from './bot-context.interface.js'
export * from './database.interface.js'
export * from './places.interface.js'

export interface CatPhoto {
    id: string,
    url: string,
}

export interface DogPhoto {
    message: string,
    status: string,
}

export interface Time {
    hours: number,
    minutes: number,
}

export interface Coords {
    lat: number,
    lon: number,
}