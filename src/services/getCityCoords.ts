import { geocodingApiUrl } from "@/config.js";
import axios from "axios";
import { Coords } from "@interfaces/interfaces.js";

export const getCityCoords = async (name: string) => {
    try {
        const { data } = await axios.get<Coords[]>(`${geocodingApiUrl}${new URLSearchParams({ q: name })}`);
        return data.length > 0 ? data[0] : null;
    } catch (e) {
        return null;
    }
}