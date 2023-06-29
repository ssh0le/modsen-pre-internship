import axios from "axios";
import { Coords, PlacesResponse } from "@/interfaces/interfaces.js";
import { placesApiUrl } from "@/config.js";


export const fetchPlaces = async (keyword: string, coord: Coords, type: string, pageToken?: string) => {
    try {
        const location = `${coord.lat},${coord.lon}`;
        const token = pageToken ? `&${new URLSearchParams({pageToken})}` : '';
        const { data } = await axios.get<PlacesResponse>(placesApiUrl + new URLSearchParams({ keyword, type, location }) + token);
        if (!['OK', 'ZERO_RESULTS'].includes(data.status)) {
            throw data.status;
        }
        return data;
    } catch (e) {
        return null;
    }
}