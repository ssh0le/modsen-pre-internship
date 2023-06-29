import { Composer, Markup, Scenes, deunionize } from "telegraf";
import { createUser } from "@/modules/index.js";
import { BotContext } from "@/interfaces/interfaces.js";
import { createEnterNameMessage, isNegativeAnswer, isRecognizedAnswer } from "@/helpers/index.js";

export const callbackActions = {
    yes: 'CHANGE_NAME_YES',
    no: 'CHANGE_NAME_NO',
};

export const introduceSceneName = 'INTRODUCE';

const GOOD_NAME = 'Nice to meet you, ';
const messages = {
    unrecognizedAnswer: 'I can\'t recognize your answer. Do you want to keep your nickname as name?',
    askToEnterName: 'Enter your name:',
    onleave: 'Type /help to select service',
    onenter: 'Type /leave to leave',
}

const yesNoKeyboard = Markup.keyboard([['Yes', 'No'], ['leave']]).oneTime().resize();
const removeKeyboard = Markup.removeKeyboard();

export const introduceComposer = new Composer<Scenes.WizardContext>();
introduceComposer.action(callbackActions.yes, async (ctx) => {
    ctx.answerCbQuery();
    ctx.state.sceneNumber = 1;
});

export const introduceScene = new Scenes.WizardScene<BotContext>(
    introduceSceneName,
    async (ctx) => {
        if (!ctx.message) {
            ctx.scene.leave();
            return;
        }
        const { text } = deunionize(ctx.message);
        if (!isRecognizedAnswer(text)) {
            ctx.reply(messages.unrecognizedAnswer);
            return ctx.wizard.selectStep(0);
        }
        if (isNegativeAnswer(text)) {
            ctx.reply(messages.askToEnterName, removeKeyboard)
            return ctx.wizard.next();
        }
        try {
            const { first_name, id } = ctx.from;
            await createUser({ telegramId: id, name: first_name, city: undefined });
            ctx.reply(`${GOOD_NAME}${first_name}`, removeKeyboard);
        } finally {
            await ctx.replyWithHTML(messages.onleave)
            ctx.scene.leave();
        }
    },
    async (ctx) => {
        if (!ctx.message) {
            ctx.scene.leave();
            return;
        }
        const { text } = deunionize(ctx.message);
        try {
            await createUser({ telegramId: ctx.from.id, name: text, city: undefined });
            await ctx.reply(`${GOOD_NAME}${text}`);
        } catch (e) {
            console.log(e);
        }
    }
);

introduceScene.enter(async (ctx) => {
    await ctx.replyWithHTML(messages.onenter);
    ctx.reply(createEnterNameMessage(ctx.from.first_name), yesNoKeyboard);
})