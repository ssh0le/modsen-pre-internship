export function isValidName(name: string): boolean {
    return /^[A-Za-z]+-?[A-Za-z]*$/.test(name);
}