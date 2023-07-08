import { Place } from "@/interfaces/index.js";

export const placeToString = (place: Place) => {
    let type = place.types[0].replace(/[^a-z]/gi, ' ');
    type = type.charAt(0).toUpperCase() + type.slice(1);
    return [
        type,
        `Name: ${decodeURIComponent(place.name)}`,
        `Address: ${decodeURIComponent(place.vicinity)}`,
    ].join('\n');
}