import { ScheduleManager } from "@/classes/scheduleManager.js";
import { Markup, Scenes, Telegraf, deunionize } from "telegraf";
import { BotContext, DBUser } from "@/interfaces/interfaces.js";
import { createSubscription, deleteSubscription, getAllSubscribtions, getSubscription, getUserByTelegramId } from "@/services/index.js";
import { fetchWeatherForecatByCityName } from "@/services/fetchWeather.js";
import { convertToTime, createForecastMessage, createInlineKeyboard, isValidName, makeOnEnterMessage } from "@/helpers/index.js";

export const subscriptionSceneName = 'SUBSCRIPTION_SCENE';

const leaveMenu = Markup.keyboard([
    ['leave']
]).oneTime().resize();

const actions = {
    subscribe: 'SUBSCRIBE',
    unsubscribe: 'UNSUBSCRIBE',
}

const messages = {
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

const makeForecast = async (city: string) => {
    try {
        const data = await fetchWeatherForecatByCityName(city);
        return  `${messages.foreacastTitle}${createForecastMessage(data)}`;
    } catch (e) {
        return messages.foreacastFailed;
    }
}

const subscriptionManager = new ScheduleManager<string>();

export const restoreScheduledSubscriptions = async (bot: Telegraf) => {
    const subscriptions = await getAllSubscribtions();
    if (!subscriptions) return;
    subscriptions.forEach(sub => {
        const { _id, time, chatId, city } = sub;
        subscriptionManager.addRecurrentJob(_id.toString(), time.hours, time.minutes, async () => {
            bot.telegram.sendMessage(chatId, await makeForecast(city));
        })
    });
}

const makeSubscribeKeyboard = (isSub: boolean) => {
    return createInlineKeyboard([[
        {
            text: isSub ? 'Unsubscribe' : 'Subscribe',
            callback_data: isSub ? actions.unsubscribe : actions.subscribe
        },
    ]])
}

const readCity = async (ctx: BotContext) => {
    const { text } = deunionize(ctx.message);
    if (text) {
        if (!isValidName(text)) {
            ctx.reply(messages.notValidCity, leaveMenu);
            ctx.wizard.selectStep(ctx.wizard.cursor - 1);
            return;
        }
        try {
            const data = await fetchWeatherForecatByCityName(text);
            if (!data) {
                throw data;
            }
        } catch (e) {
            ctx.reply(messages.cityNotFound, leaveMenu);
            ctx.wizard.selectStep(ctx.wizard.cursor - 1);
            return;
        }
    }
    ctx.scene.session.subscription.city = text;
    ctx.reply(messages.askForTime, leaveMenu)
}

const readTime = async (ctx: BotContext) => {
    const { text } = deunionize(ctx.message);
    const time = convertToTime(text);
    if (!time) {
        ctx.reply(messages.notValidTime, leaveMenu);
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
        await ctx.reply(messages.userSubscribed, leaveMenu);
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

subscriptionScene.action(actions.subscribe, async (ctx) => {
    ctx.deleteMessage();
    ctx.answerCbQuery();
    ctx.reply(messages.askForCity, leaveMenu)
    ctx.wizard.selectStep(1);
})

subscriptionScene.action(actions.unsubscribe, async (ctx) => {
    const subscriptionId = ctx.scene.session.subscription.id;
    if (subscriptionId) {
        await deleteSubscription(subscriptionId);
        await ctx.answerCbQuery(messages.userUnsubscribed);
        await ctx.deleteMessage();
        await ctx.scene.reenter();
    }
})

subscriptionScene.enter(async (ctx) => {
    await ctx.replyWithHTML(messages.onenter, leaveMenu);
    if (ctx.session.user) {
        ctx.session.user = await getUserByTelegramId(ctx.from.id);
    }
    const user: DBUser = ctx.session.user;
    const subscription = await getSubscription(user._id);
    ctx.scene.session.subscription = { userId: user._id, city: undefined, id: subscription?._id, chatId: undefined };
    ctx.reply(await makeOnEnterMessage(subscription), { reply_markup: makeSubscribeKeyboard(subscription != null) });
})
