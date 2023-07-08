import { deunionize, Scenes, Telegraf} from "telegraf";

import { ScheduleManager } from "@/classes/scheduleManager.js";
import { subscriptionActions, subscriptionMessages, subscriptionSceneName } from "@/constants/index.js";
import { convertToTime, isValidName, leaveKeyboard, makeForecast, makeOnSubscriptionEnterMessage, makeSubscribeKeyboard, restoreScheduledSubscriptions } from "@/helpers/index.js";
import { BotContext, DBUser } from "@/interfaces/index.js";
import { createSubscription, deleteSubscription, fetchWeatherForecatByCityName, getSubscription, getUserByTelegramId } from "@/services/index.js";

const subscriptionManager = new ScheduleManager<string>();

export const restoreSubscriptions = (ctx: Telegraf) => {
    restoreScheduledSubscriptions(ctx, subscriptionManager);
}

const readCity = async (ctx: BotContext) => {
    const { text } = deunionize(ctx.message);
    if (text) {
        if (!isValidName(text)) {
            ctx.reply(subscriptionMessages.notValidCity, leaveKeyboard);
            ctx.wizard.selectStep(ctx.wizard.cursor - 1);
            return;
        }
        try {
            const data = await fetchWeatherForecatByCityName(text);
            if (!data) {
                throw data;
            }
        } catch (e) {
            ctx.reply(subscriptionMessages.cityNotFound, leaveKeyboard);
            ctx.wizard.selectStep(ctx.wizard.cursor - 1);
            return;
        }
    }
    ctx.scene.session.subscription.city = text;
    ctx.reply(subscriptionMessages.askForTime, leaveKeyboard)
}

const readTime = async (ctx: BotContext) => {
    const { text } = deunionize(ctx.message);
    const time = convertToTime(text);
    if (!time) {
        ctx.reply(subscriptionMessages.notValidTime, leaveKeyboard);
        ctx.wizard.selectStep(ctx.wizard.cursor - 1);
        return;
    }
    const serverTime = Object.assign({}, time);
    serverTime.hours -= 3;
    if (serverTime.hours < 0) serverTime.hours += 24;
    const { city, userId } = ctx.scene.session.subscription;
    if (city && userId) {
        const sub = await createSubscription(userId, serverTime, city, ctx.chat.id);
        ctx.scene.session.subscription.id = sub.id;
        subscriptionManager.addRecurrentJob(userId.toString(), serverTime.hours, serverTime.minutes, async () => {
            await ctx.reply(await makeForecast(city));
        })
        await ctx.reply(subscriptionMessages.userSubscribed, leaveKeyboard);
        ctx.scene.reenter();
    }
}

export const subscriptionScene = new Scenes.WizardScene<BotContext>(
    subscriptionSceneName,
    async (ctx) => {
        ctx.wizard.selectStep(ctx.wizard.cursor);
    },
    async (ctx) => {
        await readCity(ctx);
        return ctx.wizard.next();
    },
    async (ctx) => {
        await readTime(ctx);
        return ctx.wizard.next();
    },
    async (ctx) => {
        ctx.scene.reenter();
    }
);

subscriptionScene.action(subscriptionActions.subscribe, async (ctx) => {
    ctx.deleteMessage();
    ctx.answerCbQuery();
    ctx.reply(subscriptionMessages.askForCity, leaveKeyboard)
    ctx.wizard.selectStep(1);
})

subscriptionScene.action(subscriptionActions.unsubscribe, async (ctx) => {
    const subscriptionId = ctx.scene.session.subscription.id;
    if (subscriptionId) {
        subscriptionManager.cancelJob(subscriptionId.toString());
        await deleteSubscription(subscriptionId);
        await ctx.answerCbQuery(subscriptionMessages.userUnsubscribed);
        await ctx.deleteMessage();
        await ctx.scene.reenter();
    }
})

subscriptionScene.enter(async (ctx) => {
    await ctx.replyWithHTML(subscriptionMessages.onenter, leaveKeyboard);
    if (ctx.session.user) {
        ctx.session.user = await getUserByTelegramId(ctx.from.id);
    }
    const user: DBUser = ctx.session.user;
    const subscription = await getSubscription(user.id);
    ctx.scene.session.subscription = { userId: user.id, city: undefined, id: subscription?.id, chatId: undefined };
    ctx.reply(await makeOnSubscriptionEnterMessage(subscription), { reply_markup: makeSubscribeKeyboard(subscription != null) });
})
