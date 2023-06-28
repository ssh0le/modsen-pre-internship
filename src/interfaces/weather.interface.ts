import { Coords } from "./interfaces.js"

export interface Weather {
    coord: Coords
    weather: Description[]
    main: Main
    wind: Wind
    name: string
    cod: number
    sys: CountryInfo
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

export interface CountryInfo {
    country: string
}

export interface WeatherError {
    cod: string,
    message: string,
}
