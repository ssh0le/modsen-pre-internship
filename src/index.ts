import { Telegraf,Context, Markup } from 'telegraf';
import * as dotenv from 'dotenv';
import axios from 'axios';
import { BotContext, CatPhoto, DogPhoto } from 'interfaces.js';
import {helpOptions} from './options.js'

dotenv.config()

const botToken = process.env.TELEGRAM_API_TOKEN as string;
const catApiUrl = process.env.CAT_API_URL as string;
const dogApiUrl = process.env.DOG_API_URL as string

const bot = new Telegraf<Context>(botToken);

bot.start((ctx) => {
    ctx.reply(`Hello! I'm Alfred-bot, glad to see you.`);
})

const sendCatPhoto = async (ctx: BotContext) => {
    try {
        const response = await axios.get<CatPhoto[]>(catApiUrl);
        ctx.telegram.sendPhoto(ctx.message.chat.id, response.data[0].url);
    } catch(e) {
        ctx.telegram.sendMessage(ctx.message.chat.id, 'Fetching cat photo error');
    }
}

const sendDogPhoto = async (ctx: BotContext) => {
    try {
        const response = await axios.get<DogPhoto>(dogApiUrl);
        if (response.data.status === 'success') {
            ctx.telegram.sendPhoto(ctx.message.chat.id, response.data.message);
        } else {
            throw response.data.status;
        }
    } catch(e) {
        ctx.telegram.sendMessage(ctx.message.chat.id, 'Fetching dog photo error',);
    }
}

bot.command('cat', async (ctx) => {
    sendCatPhoto(ctx);
});

bot.command('dog', async (ctx) => {
    sendDogPhoto(ctx);
});

bot.command('help', async (ctx) => {
    ctx.telegram.sendMessage(ctx.message.chat.id, 'Select command', {reply_markup: helpOptions});
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));