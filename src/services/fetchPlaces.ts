import axios from "axios";
import { Coords, PlacesResponse } from "../interfaces.js";


const apiUrl = process.env.PLACES_API_URL;

export const fetchPlaces = async (keyword: string, coord: Coords, type: string) => {
    const location = coord.lat + ',' + coord.lon;
    const {data} = await axios.get<PlacesResponse>(apiUrl + new URLSearchParams({keyword, type, location}));
    if (!['OK', 'ZERO_RESULTS'].includes(data.status)) {
        return null;
    }
    return data;
}