import 'module-alias/register.js';
import { Telegraf, session } from 'telegraf';
import { BotContext } from '@/interfaces/interfaces.js';
import { sceneComposer } from '@/scenes/index.js';
import { message } from 'telegraf/filters';
import { restoreScheduledSubscriptions } from '@/scenes/subscription.js';
import { botToken } from './config.js';
import { placesService, sendCatPhoto, sendDescription, sendDogPhoto, subscriptionService, taskService, weatherComposer, weatherService } from './modules/index.js';

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
    await sendCatPhoto(ctx);
    sendDescription(ctx);
});

bot.command('dog', async (ctx) => {
    await sendDogPhoto(ctx);
    await sendDescription(ctx);
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

bot.command('places', async (ctx) => {
    placesService(ctx as BotContext);
})

bot.on(message('text'), async (ctx) => {
    sendDescription(ctx)
})

bot.launch();

restoreScheduledSubscriptions(bot);

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));