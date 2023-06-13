import { Telegraf,Context } from 'telegraf';
import * as dotenv from 'dotenv';
import { sendCatPhoto } from './modules/catModule.js';
import { sendDogPhoto } from './modules/dogModule.js';
import {helpOptions, optionComposer} from './modules/options.js'
import { sendDescription } from './modules/helpModule.js';

dotenv.config()

const botToken = process.env.TELEGRAM_API_TOKEN as string;

const bot = new Telegraf<Context>(botToken);

bot.use(optionComposer);

bot.start((ctx) => {
    ctx.reply(`Hello! I'm Alfred-bot, glad to see you.`);
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

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));