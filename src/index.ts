import { Telegraf, session } from 'telegraf';
import * as dotenv from 'dotenv';
import { sendCatPhoto } from './modules/catModule.js';
import { sendDogPhoto } from './modules/dogModule.js';
import { sendDescription } from './modules/helpModule.js';
import { weatherComposer, weatherService } from './modules/weatherModule.js';
import { BotContext } from 'interfaces.js';
import { taskService} from './modules/tasksModule.js';
import { sceneComposer } from './scenes/index.js';
import { message } from 'telegraf/filters';
import { subscriptionService } from './modules/subscriptionModule.js';
import { restoreScheduledSubscriptions } from './scenes/subscription.js';

dotenv.config()

const botToken = process.env.TELEGRAM_API_TOKEN as string;

const bot = new Telegraf(botToken);

bot.use(session());
bot.use(weatherComposer);
bot.use(sceneComposer);

bot.start(async (ctx) => {
    await ctx.reply('👋');
    await ctx.reply(`Hello! I'm Alfred-bot, glad to see you.`);
    sendDescription(ctx);
    ctx.state.telegramId = ctx.from.id;
})

bot.command('cat', async (ctx) => {
    sendCatPhoto(ctx);
});

bot.command('dog', async (ctx) => {
    sendDogPhoto(ctx);
});

bot.command('help', async (ctx) => {
    sendDescription(ctx);
});

bot.command('weather', async (ctx) => {
    await ctx.reply('You have selected a weather forecast by city name');
    weatherService(ctx as BotContext);
});

bot.command('tasks', async (ctx) => {
    taskService(ctx as BotContext);
})

bot.command('subscription', async (ctx) => {
    subscriptionService(ctx as BotContext);
})

bot.on(message('text'), async (ctx) => {
    sendDescription(ctx)
})

bot.launch();

restoreScheduledSubscriptions(bot);

console.log(new Date(), " ", new Date().getTimezoneOffset());

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));