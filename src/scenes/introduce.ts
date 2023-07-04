import { Composer, deunionize,Markup, Scenes } from "telegraf";

import { introduceActions, introduceMessages as messages, introduceRemoveKeyboard as removeKeyboard, introduceSceneName, yesNoKeyboard } from "@/constants/index.js";
import { createEnterNameMessage, isNegativeAnswer, isRecognizedAnswer } from "@/helpers/index.js";
import { BotContext } from "@/interfaces/interfaces.js";
import { createUser } from "@/services/index.js";

export const introduceComposer = new Composer<Scenes.WizardContext>();
introduceComposer.action(introduceActions.yes, async (ctx) => {
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
            ctx.reply(`${messages.goodName}${first_name}`, removeKeyboard);
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
            await ctx.reply(`${messages.goodName}${text}`);
        } catch (e) {
            console.log(e);
        }
    }
);

introduceScene.enter(async (ctx) => {
    await ctx.replyWithHTML(messages.onenter);
    ctx.reply(createEnterNameMessage(ctx.from.first_name), yesNoKeyboard);
})