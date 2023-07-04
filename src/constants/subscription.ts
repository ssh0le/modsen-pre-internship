import { Markup } from "telegraf";

export const subscriptionSceneName = 'SUBSCRIPTION_SCENE';

export const leaveMenu = Markup.keyboard([
    ['leave']
]).oneTime().resize();

export const subscriptionActions = {
    subscribe: 'SUBSCRIBE',
    unsubscribe: 'UNSUBSCRIBE',
}

export const subscriptionMessages = {
    foreacastTitle: 'Daily forecast subscription:\n\n',
    foreacastFailed: 'Daily foreact failed',
    notValidCity: 'Wrong city name format. Please repeat:',
    cityNotFound: 'City not found, pelase reenter: ',
    askForTime: 'Enter time for subscription in format HH:MM: ',
    notValidTime: 'Wrong format of time. Please reenter: ',
    userSubscribed: 'You have subscribed on daily weather foreacast!',
    userUnsubscribed: 'You unsubscribed',
    askForCity: 'Enter city name for subscription: ',
    onenter: 'Type /leave to leave',
}
