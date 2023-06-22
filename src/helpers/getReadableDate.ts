export const getReadableDate = (d: Date): string => {
    return [[
        padStart(d.getDate()),
        padStart(d.getMonth() + 1),
        d.getFullYear(),
    ].join('-'),
    [
        padStart(d.getHours()),
        padStart(d.getMinutes()),
    ].join(':'),
].join(' ');
}

const padStart = (char: number) => {
    return String(char).padStart(2, '0')
}