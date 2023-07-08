export const updateKeyword = (placeType: string, city: string) => {
    if (placeType === 'Any type') {
        return `places of interest in ${city}`;
    }
    return '';
}