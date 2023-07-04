import { Markup } from "telegraf";

export const placesPerPage = 10;
export const placesSceneName = 'PLACES';

export const placesMessages = {
    leaveHint: 'Type /leave to leave from service',
    onenter: 'Enter the city name:',
    onleave: 'Type /help for more',
    noPlaces: 'No available places of interest in this city',
    invalidCity: 'Not valid city name',
    askToSelectType: 'Select type:',
    wrongType: 'Please select type from given list:',
    cityNotFound: 'City with such name wasn\'t found, please reenter:',
}

export const placeTypes = ["Bar", "Restaurant", "Amusement park", "Art gallery", "Cafe", "Movie theater", "Night club", "Any type"];

export const placesRemoveKeyboard = Markup.removeKeyboard();
export const placesLeaveKeyboard = Markup.keyboard([
    ['leave'],
]).oneTime().resize();
