
export function isValidCityName(name: string): boolean {
    return /^[A-Za-z]+$/.test(name);
}