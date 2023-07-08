import { Time } from "../interfaces/index.js";

// Following regExp describe time template in format HH:MM
// Example: 0:0 23:59
export const convertToTime = (time: string): Time | null => {
    const digits = time.match(/[0-2]?[0-9]?[:./]{1}[0-6]?[0-9]?/)[0]?.match(/[0-9]{1,2}/g);
    if (!digits || !digits.length || digits.length !== 2) return null;
    const [h, m] = digits;
    if (+h < 24 && +m < 60) return {hours: +h, minutes: +m};
    return null;
}