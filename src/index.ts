import { Telegraf } from 'telegraf';
import * as dotenv from 'dotenv';
import { sendCatPhoto } from './modules/catModule.js';
import { sendDogPhoto } from './modules/dogModule.js';
import { sendDescription } from './modules/helpModule.js';
import { weatherComposer, weatherService } from './modules/weatherModule.js';
import { BotContext } from 'interfaces.js';

dotenv.config()

const botToken = process.env.TELEGRAM_API_TOKEN as string;

const bot = new Telegraf(botToken);

bot.use(weatherComposer);

bot.start(async (ctx) => {
    await ctx.reply('👋');
    await ctx.reply(`Hello! I'm Alfred-bot, glad to see you.`);
    sendDescription(ctx);
    console.log(ctx.from);
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

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));