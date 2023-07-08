import { session,Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';

import { botCommands, botMessages } from '@/constants/index.js';
import { BotContext } from '@/interfaces/index.js';
import { placesService, sendCatPhoto, sendDescription, sendDogPhoto, subscriptionService, taskService, weatherComposer, weatherService } from '@/modules/index.js';
import { restoreSubscriptions, sceneComposer } from '@/scenes/index.js';

import { botToken } from './config.js';

const bot = new Telegraf(botToken);

bot.use(session());
bot.use(weatherComposer);
bot.use(sceneComposer);

bot.start(async (ctx) => {
    await ctx.reply(botMessages.greetingEmoji);
    await ctx.reply(botMessages.greeting);
    sendDescription(ctx);
    ctx.state.telegramId = ctx.from.id;
})

bot.command(botCommands.cat, async (ctx) => {
    await sendCatPhoto(ctx);
    sendDescription(ctx);
});

bot.command(botCommands.dog, async (ctx) => {
    await sendDogPhoto(ctx);
    await sendDescription(ctx);
});

bot.command(botCommands.help, async (ctx) => {
    sendDescription(ctx);
});

bot.command(botCommands.weather, async (ctx) => {
    weatherService(ctx as BotContext);
});

bot.command(botCommands.tasks, async (ctx) => {
    taskService(ctx as BotContext);
})

bot.command(botCommands.subscription, async (ctx) => {
    subscriptionService(ctx as BotContext);
})

bot.command(botCommands.places, async (ctx) => {
    placesService(ctx as BotContext);
})

bot.on(message('text'), async (ctx) => {
    sendDescription(ctx)
})

bot.launch();

restoreSubscriptions(bot);

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));