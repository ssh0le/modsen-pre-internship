export const convertDate = (str: string): Date | null => {
    // Following regExp describe date template in format DD:MM:YYYY HH:MM
    // Example: 21.12.2012 0.0     14/6/2023 23/59
    const matches = str.match(/[0-3]?[0-9].[0-1]?[0-9].202[3-9].{1}[0-2]?[0-9].[0-6]?[0-9]/);
    if (!matches || !matches.length) return null;
    const date = matches[0];
    // Following regExp describe any number that has 1-4 digits 
    // Example: 21.12.2012 0.0     14/6/2023 23/59
    const [d, m, y, h, min] = date.match(/[0-9]{1,4}/gi).slice(0, 5);
    if (!isValidDate(+d, +m - 1, +y) || !isValidTime(+h, +min)) return null;
    const convertedDate = new Date(+y, +m - 1, +d, +h, +min);
    return convertedDate > new Date() ? convertedDate : null;
}

const isValidDate = (d: number, m: number, y: number) => {
    const d1 = new Date(y, m, d);
    return d1.getDate() === d && d1.getMonth() === m && d1.getFullYear() === y;
}

const isValidTime = (h: number, m: number) => {
    return (h <= 23 && m >= 0 && m < 60);
}

