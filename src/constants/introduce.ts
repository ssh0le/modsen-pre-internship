import { Markup } from "telegraf";

export const introduceSceneName = 'INTRODUCE';

export const introduceActions = {
    yes: 'CHANGE_NAME_YES',
    no: 'CHANGE_NAME_NO',
};

export const introduceMessages = {
    unrecognizedAnswer: 'I can\'t recognize your answer. Do you want to keep your nickname as name?',
    askToEnterName: 'Enter your name:',
    onleave: 'Type /help to select service',
    onenter: 'Type /leave to leave',
    goodName: 'Nice to meet you, ',
}

export const yesNoKeyboard = Markup.keyboard([['Yes', 'No'], ['leave']]).oneTime().resize();
export const introduceRemoveKeyboard = Markup.removeKeyboard();
