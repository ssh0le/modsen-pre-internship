import axios from "axios";
import { Coords } from "interfaces.js";


const apiUrl = process.env.GEOCODING_API_URL;

export const getCityCoords = async (name: string) => {
    try {
        const { data } = await axios.get<Coords[]>(apiUrl + new URLSearchParams({ q: name }));
        return data.length > 0 ? data[0] : null;
    } catch (e) {
        return null;
    }
}