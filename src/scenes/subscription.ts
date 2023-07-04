import { deunionize, Scenes, Telegraf} from "telegraf";

import { ScheduleManager } from "@/classes/scheduleManager.js";
import { leaveMenu, subscriptionActions, subscriptionMessages, subscriptionSceneName } from "@/constants/subscription.js";
import { convertToTime, isValidName, makeForecast, makeOnEnterMessage, makeSubscribeKeyboard } from "@/helpers/index.js";
import { restoreScheduledSubscriptions } from "@/helpers/restoreScheduledSubscriptions.js";
import { BotContext, DBUser } from "@/interfaces/interfaces.js";
import { createSubscription, deleteSubscription, fetchWeatherForecatByCityName, getSubscription, getUserByTelegramId } from "@/services/index.js";

const subscriptionManager = new ScheduleManager<string>();

export const restoreSubscriptions = (ctx: Telegraf) => {
    restoreScheduledSubscriptions(ctx, subscriptionManager);
}

const readCity = async (ctx: BotContext) => {
    const { text } = deunionize(ctx.message);
    if (text) {
        if (!isValidName(text)) {
            ctx.reply(subscriptionMessages.notValidCity, leaveMenu);
            ctx.wizard.selectStep(ctx.wizard.cursor - 1);
            return;
        }
        try {
            const data = await fetchWeatherForecatByCityName(text);
            if (!data) {
                throw data;
            }
        } catch (e) {
            ctx.reply(subscriptionMessages.cityNotFound, leaveMenu);
            ctx.wizard.selectStep(ctx.wizard.cursor - 1);
            return;
        }
    }
    ctx.scene.session.subscription.city = text;
    ctx.reply(subscriptionMessages.askForTime, leaveMenu)
}

const readTime = async (ctx: BotContext) => {
    const { text } = deunionize(ctx.message);
    const time = convertToTime(text);
    if (!time) {
        ctx.reply(subscriptionMessages.notValidTime, leaveMenu);
        ctx.wizard.selectStep(ctx.wizard.cursor - 1);
        return;
    }
    const serverTime = Object.assign({}, time);
    serverTime.hours -= 3;
    if (serverTime.hours < 0) serverTime.hours += 24;
    const { city, userId } = ctx.scene.session.subscription;
    if (city && userId) {
        const sub = await createSubscription(userId, serverTime, city, ctx.chat.id);
        ctx.scene.session.subscription.id = sub._id;
        subscriptionManager.addRecurrentJob(userId.toString(), serverTime.hours, serverTime.minutes, async () => {
            await ctx.reply(await makeForecast(city));
        })
        await ctx.reply(subscriptionMessages.userSubscribed, leaveMenu);
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
    ctx.reply(subscriptionMessages.askForCity, leaveMenu)
    ctx.wizard.selectStep(1);
})

subscriptionScene.action(subscriptionActions.unsubscribe, async (ctx) => {
    const subscriptionId = ctx.scene.session.subscription.id;
    if (subscriptionId) {
        await deleteSubscription(subscriptionId);
        await ctx.answerCbQuery(subscriptionMessages.userUnsubscribed);
        await ctx.deleteMessage();
        await ctx.scene.reenter();
    }
})

subscriptionScene.enter(async (ctx) => {
    await ctx.replyWithHTML(subscriptionMessages.onenter, leaveMenu);
    if (ctx.session.user) {
        ctx.session.user = await getUserByTelegramId(ctx.from.id);
    }
    const user: DBUser = ctx.session.user;
    const subscription = await getSubscription(user._id);
    ctx.scene.session.subscription = { userId: user._id, city: undefined, id: subscription?._id, chatId: undefined };
    ctx.reply(await makeOnEnterMessage(subscription), { reply_markup: makeSubscribeKeyboard(subscription != null) });
})
