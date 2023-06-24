import { ScheduleManager } from "../classes/scheduleManager.js";
import { Scenes, Telegraf, deunionize } from "telegraf";
import { BotContext, DBSubscription, DBUser } from "../interfaces.js";
import { createInlineKeyboard } from "../helpers/createInlineKeyboard.js";
import { convertToTime } from "../helpers/convertToTime.js";
import { isValidName } from "../helpers/isValidCityName.js";
import { createSubscription, deleteSubscription, getAllSubscribtions, getSubscription, getUserByTelegramId } from "../modules/database/database.js";
import { createForecastMessage } from "../helpers/createForeacastMessage.js";
import { fetchWeatherForecatByCityName } from "../services/fetchWeather.js";

export const subscriptionSceneName = 'SUBSCRIPTION_SCENE';


const actions = {
    subscribe: 'SUBSCRIBE',
    unsubscribe: 'UNSUBSCRIBE',
}

const makeForecast = async (city: string) => {
    try {
        const data = await fetchWeatherForecatByCityName(city);
        return "Today forecast:\n\n" + createForecastMessage(data);
    } catch (e) {
        return 'Foreact failed'
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
        message += `City: ${subscription.city}\nTime: ${subscription.time.hours}:${String(subscription.time.minutes).padStart(2, "0")}`;
    } else {
        message += 'You are not subscribed'
    }
    return message
}

const readCity = async (ctx: BotContext) => {
    const { text } = deunionize(ctx.message);
    if (text && !isValidName(text)) {
        ctx.reply('Wrong city name format. Please repeat:');
        ctx.wizard.selectStep(ctx.wizard.cursor);
        return;
    }
    ctx.scene.session.subscription.city = text;
    ctx.reply('Enter time for subscription: ')
}

const readTime = async (ctx: BotContext) => {
    const { text } = deunionize(ctx.message);
    const time = convertToTime(text);
    if (!time) {
        ctx.reply('Wrong format of time. Please reenter: ');
        ctx.wizard.selectStep(ctx.wizard.cursor);
        return;
    }
    const { city, userId } = ctx.scene.session.subscription;
    if (city && userId) {
        const sub = await createSubscription(userId, time, city, ctx.chat.id);
        ctx.scene.session.subscription.id = sub._id;
        subscriptionManager.addRecurrentJob(userId.toString(), time.hours, time.minutes, async () => {
            ctx.reply(await makeForecast(city));
        })
        ctx.reply('You have subscribed on daily weather foreacast!');
    }
    ctx.scene.reenter();
}

export const subscriptionScene = new Scenes.WizardScene<BotContext>(
    subscriptionSceneName,
    async (ctx) => {
        await readCity(ctx);
        return ctx.wizard.next();
    },
    async (ctx) => {
        await readTime(ctx);
    },
    async (ctx) => {
        ctx.scene.reenter();
    }
);

subscriptionScene.action(actions.subscribe, async (ctx) => {
    ctx.deleteMessage();
    ctx.answerCbQuery();
    ctx.reply('Enter city name for subscription: ')
    ctx.wizard.selectStep(0);
})

subscriptionScene.action(actions.unsubscribe, async (ctx) => {
    const subscriptionId = ctx.scene.session.subscription.id;
    if (subscriptionId) {
        await deleteSubscription(subscriptionId);
        await ctx.deleteMessage();
        await ctx.answerCbQuery('You unsubscribed');
        await ctx.scene.reenter();
    }
})

subscriptionScene.hears('leave', async (ctx) => {
    ctx.reply('You have left subscription service');
    ctx.scene.leave();
})

subscriptionScene.enter(async (ctx) => {
    if (ctx.session.user) {
        ctx.session.user = await getUserByTelegramId(ctx.from.id);
    }
    const user: DBUser = ctx.session.user;
    const subscription = await getSubscription(user._id);
    ctx.scene.session.subscription = { userId: user._id, city: undefined, id: subscription?._id, chatId: undefined };
    ctx.reply(await makeOnEnterMessage(subscription), { reply_markup: makeSubscribeKeyboard(subscription != null) });
})