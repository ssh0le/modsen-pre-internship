import { Composer, Markup, Scenes, deunionize } from "telegraf";
import { createUser } from "../modules/database/database.js";
import { BotContext } from "interfaces.js";
import { tasksSceneName } from "./tasks.js";

export const callbackActions = {
    yes: 'CHANGE_NAME_YES',
    no: 'CHANGE_NAME_NO',
};

export const introduceSceneName = 'INTRODUCE';

const GOOD_NAME = 'Nice to meet you, ';

const yesNoKeyboard = Markup.keyboard([['Yes', 'No'], ['leave']]).oneTime().resize();
const removeKeyboard = Markup.removeKeyboard();

const createEnterNameMessage = (nickname: string): string => {
    return `Do you want to keep this name \'${nickname}\'?`;
};

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
        if (!text.toLowerCase().includes('yes') && !text.toLowerCase().includes('no')) {
            ctx.reply('I can\'t recognize your answer. Do you want to keep your nickname as name?');
            return ctx.wizard.selectStep(0);
        }
        if (text.toLowerCase().includes('no')) {
            ctx.reply('Enter your name:', removeKeyboard)
            return ctx.wizard.next();
        }
        try {
            const { first_name, id } = ctx.from;
            await createUser({ telegramId: id, name: first_name, city: undefined });
            ctx.reply(GOOD_NAME + first_name, removeKeyboard);
        } finally {
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
            await ctx.reply(GOOD_NAME + text);
            ctx.scene.enter(tasksSceneName);
        } catch (e) {
            console.log(e);
        }
    }
);

introduceScene.enter(ctx => {
    ctx.reply(createEnterNameMessage(ctx.from.first_name), yesNoKeyboard);
})

introduceScene.hears('leave', async (ctx) => {
    await ctx.scene.leave();
})