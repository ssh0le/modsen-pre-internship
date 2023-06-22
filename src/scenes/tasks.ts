import { BotContext, DBTask, DBUser, WeatherError } from "../interfaces.js";
import { fetchWeatherForecatByCityName } from "../services/fetchWeather.js";
import { Composer, Context, Markup, Middleware, MiddlewareFn, Scenes, Telegraf, deunionize } from "telegraf";
import { createTask, deleteTask, getTasksByUserId, getUserByTelegramId } from "../modules/database/database.js";
import { message } from "telegraf/filters";
import { BaseScene } from "telegraf/scenes";
import { Update } from "telegraf/types";
import { convertDate } from "../helpers/convertDate.js";
import { getReadableDate } from "../helpers/getReadableDate.js";
import { taskToString } from "../helpers/tasksToString.js";
import { createInlineKeyboard } from "../helpers/createInlineKeyboard.js";
import { ObjectId } from "mongoose";

export const tasksSceneName = 'TASKS'

const actions = {
    deleteTask: 'DELETE_TASK',
    remindTask: 'REMIND_TASK'
}

const optionsKeyboard = Markup.keyboard([
    ['Add task'],
    ['Select task'],
    ['leave'],
]).oneTime().resize();

const removeKeyboard = Markup.removeKeyboard();

const makeTaskKeyboard = (taskId: ObjectId) => {
    return createInlineKeyboard([
        [{text: 'Delete', callback_data: `${actions.deleteTask}-${taskId}`}, {text: 'Notify', callback_data: actions.remindTask}]
    ]);
}

export const tasksScene = new Scenes.WizardScene<BotContext>(
    tasksSceneName,
    async (ctx) => {
        ctx.reply('Select operation');
        return ctx.wizard.selectStep(0);
    },
    async (ctx) => {
        const { text } = deunionize(ctx.message);
        ctx.scene.session.newTask = {};
        const { newTask } = ctx.scene.session;
        newTask.description = text;
        ctx.reply('Date in format DD/MM/YYYY HH:MM:');
        return ctx.wizard.next();
    },
    async (ctx) => {
        try {
            const { text } = deunionize(ctx.message);
            const date = convertDate(text);
            if (!date) {    
                await ctx.reply('Wrong date format, try again:');
                ctx.wizard.selectStep(ctx.wizard.cursor);
                return;
            }
            const description = ctx.scene.session.newTask.description;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const user: DBUser = ctx.session.user;
            await createTask({userId: user._id, description, date});
            ctx.scene.reenter();
        } catch (e) {
            console.log(e);
            ctx.wizard.selectStep(ctx.wizard.cursor);
            ctx.scene.leave();
        }
    },
    async (ctx) => {
        const { text } = deunionize(ctx.message);
        const taskId = parseInt(text) - 1;
        if (Number.isInteger(taskId) && ctx.session.tasks) {
            if (!ctx.session.tasks.length) {
                ctx.reply('You don\'t have tasks to choose from');
                ctx.scene.reenter();
                return;
            }
            const tasks: DBTask[] = ctx.session.tasks;
            if (taskId >= tasks.length || taskId < 0) {
                ctx.reply('I don\'t see the task with this id. Please reenter:');
                ctx.wizard.selectStep(ctx.wizard.cursor);
                return;
            }
            ctx.reply(taskToString(tasks[taskId]), {reply_markup: makeTaskKeyboard(tasks[taskId]._id)});
        } else {
            if (ctx.session.tasks) {
                ctx.reply('Wrong format of number');
                ctx.wizard.selectStep(ctx.wizard.cursor);
            } else {
                ctx.reply('Refreshing...')
                ctx.scene.reenter();
            }
        }
    },
    async (ctx) => {
        ctx.reply('', removeKeyboard);
    }
);

tasksScene.action(/^DELETE_TASK-[0-9a-z]*$/, async (ctx) => {
    const taskId = ctx.match[0].split('-')[1];
    await deleteTask(taskId);
    ctx.answerCbQuery('Task has been deleted');
    ctx.deleteMessage();
    ctx.scene.enter(tasksSceneName);
})

tasksScene.hears('Add task', async (ctx) => {
    ctx.reply('Enter description: ', removeKeyboard);
    ctx.wizard.selectStep(1);
})

tasksScene.hears('Select task', async (ctx) => {
    ctx.reply('Enter number of the task: ', removeKeyboard);
    ctx.wizard.selectStep(3);
})


tasksScene.enter(async ctx => {
    ctx.reply('Your Tasks:', optionsKeyboard);
    if (ctx.session.user) {
        ctx.session.user = await getUserByTelegramId(ctx.from.id);
    }
    const user:DBUser = ctx.session.user;
    ctx.session.tasks = await getTasksByUserId(user._id);
    const tasks: DBTask[] = ctx.session.tasks;
    if (tasks.length){
        let result = '';
        for (let i = 0; i < tasks.length; i++) {
            result += `${i + 1}. ${taskToString(tasks[i])}\n\n`;
        }
        ctx.reply(result.trimEnd())
    } else {
        ctx.reply('You have no tasks');
    }
})

tasksScene.hears('leave', async (ctx) => {
    ctx.reply('You has left task service', removeKeyboard);
    ctx.scene.leave();
})