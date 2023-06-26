import { ScheduleManager } from "../classes/scheduleManager.js";
import { Markup, Scenes, Telegraf, deunionize } from "telegraf";
import { BotContext, DBSubscription, DBUser } from "../interfaces.js";
import { createInlineKeyboard } from "../helpers/createInlineKeyboard.js";
import { convertToTime } from "../helpers/convertToTime.js";
import { isValidName } from "../helpers/isValidCityName.js";
import { createSubscription, deleteSubscription, getAllSubscribtions, getSubscription, getUserByTelegramId } from "../modules/database/database.js";
import { createForecastMessage } from "../helpers/createForeacastMessage.js";
import { fetchWeatherForecatByCityName } from "../services/fetchWeather.js";

export const subscriptionSceneName = 'SUBSCRIPTION_SCENE';

const leaveMenu = Markup.keyboard([
    ['leave']
]).oneTime().resize();

const removeKeyboard = Markup.removeKeyboard();


const actions = {
    subscribe: 'SUBSCRIBE',
    unsubscribe: 'UNSUBSCRIBE',
}

const makeForecast = async (city: string) => {
    try {
        const data = await fetchWeatherForecatByCityName(city);
        return "Daily forecast subscription:\n\n" + createForecastMessage(data);
    } catch (e) {
        return 'Daily foreact failed'
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

const makeOnEnterMessage = async (subscription: DBSubscription) => {
    let message = `Daily weather forecast subscription\n`;
    if (subscription) {
        message += `Your subscription:\n`
        let hours = subscription.time.hours + 3;
        if (hours > 23) {
            hours -= 24;
        }
        message += `City: ${subscription.city}\nTime: ${hours}:${String(subscription.time.minutes).padStart(2, "0")}`;
    } else {
        message += 'You are not subscribed'
    }
    return message
}

const readCity = async (ctx: BotContext) => {
    const { text } = deunionize(ctx.message);
    if (text) {
        if (!isValidName(text)) {
            ctx.reply('Wrong city name format. Please repeat:', leaveMenu);
            ctx.wizard.selectStep(ctx.wizard.cursor - 1);
            return;
        }
        try {
            const data = await fetchWeatherForecatByCityName(text);
        } catch (e) {
            ctx.reply('City not found, pelase reenter: ', leaveMenu);
            ctx.wizard.selectStep(ctx.wizard.cursor - 1);
            return;
        }
    }
    ctx.scene.session.subscription.city = text;
    ctx.reply('Enter time for subscription: ', leaveMenu)
}

const readTime = async (ctx: BotContext) => {
    const { text } = deunionize(ctx.message);
    const time = convertToTime(text);
    if (!time) {
        ctx.reply('Wrong format of time. Please reenter: ', leaveMenu);
        ctx.wizard.selectStep(ctx.wizard.cursor - 1);
        return;
    }
    const serverTime = Object.assign({}, time);
    serverTime.hours -= 3;
    if (serverTime.hours < 0) serverTime.hours += 24;
    const { city, userId } = ctx.scene.session.subscription;
    if (city && userId) {
        const sub = await createSubscription(userId, serverTime, city, ctx.chat.id);
        console.log(sub);
        ctx.scene.session.subscription.id = sub._id;
        subscriptionManager.addRecurrentJob(userId.toString(), serverTime.hours, serverTime.minutes, async () => {
            await ctx.reply(await makeForecast(city));
        })
        await ctx.reply('You have subscribed on daily weather foreacast!', leaveMenu);
        ctx.scene.reenter();
    }
}

export const subscriptionScene = new Scenes.WizardScene<BotContext>(
    subscriptionSceneName,
    async (ctx) => {
        ctx.reply('Type \'leave\' to leave', leaveMenu);
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
    ctx.reply('Enter city name for subscription: ', leaveMenu)
    ctx.wizard.selectStep(1);
})

subscriptionScene.action(actions.unsubscribe, async (ctx) => {
    const subscriptionId = ctx.scene.session.subscription.id;
    if (subscriptionId) {
        await deleteSubscription(subscriptionId);
        await ctx.answerCbQuery('You unsubscribed');
        await ctx.deleteMessage();
        await ctx.scene.reenter();
    }
})

subscriptionScene.hears('leave', async (ctx) => {
    await ctx.replyWithHTML('You have left subscription service. Type /help to select another service', removeKeyboard);
    await ctx.scene.leave();
})

subscriptionScene.enter(async (ctx) => {
    if (ctx.session.user) {
        ctx.session.user = await getUserByTelegramId(ctx.from.id);
    }
    const user: DBUser = ctx.session.user;
    console.log(user);
    const subscription = await getSubscription(user._id);
    ctx.scene.session.subscription = { userId: user._id, city: undefined, id: subscription?._id, chatId: undefined };
    ctx.reply(await makeOnEnterMessage(subscription), { reply_markup: makeSubscribeKeyboard(subscription != null) });
})
