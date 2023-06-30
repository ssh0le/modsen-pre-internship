// RegExp here describes a city name
// Example: Warsaw, Riga
export function isValidName(name: string): boolean {
    return /^[A-Za-z]+$/.test(name);
}