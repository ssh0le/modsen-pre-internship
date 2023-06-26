import { BotContext, DBTask, DBUser } from "../interfaces.js";
import { Markup, Scenes, deunionize } from "telegraf";
import { createTask, deleteTask, getTasksByUserId, getUserByTelegramId } from "../modules/database/database.js";
import { convertDate } from "../helpers/convertDate.js";
import { taskToString } from "../helpers/tasksToString.js";
import { createInlineKeyboard } from "../helpers/createInlineKeyboard.js";
import { ScheduleManager } from "../classes/scheduleManager.js";
import { getFormattedFullDate } from "../helpers/getFormattedFullDate.js";

export const tasksSceneName = 'TASKS'
const dateFormat = "DD/MM/YYYY HH:MM"

const notificationManager = new ScheduleManager<string>();

const actions = {
    deleteTask: 'DELETE_TASK',
    remindTask: 'REMIND_TASK',
    cancelRemindTask: 'CANCEL_REMIND_TASK'
}

const optionsKeyboard = Markup.keyboard([
    ['Add task'],
    ['Select task'],
    ['leave'],
]).oneTime().resize();

const menuKeyboard = Markup.keyboard([
    ['Menu'],
]).oneTime().resize();

const removeKeyboard = Markup.removeKeyboard();

const makeTaskKeyboard = (task: DBTask) => {
    const has = notificationManager.hasJob(task._id.toString());
    return createInlineKeyboard([
        [
            { text: 'Delete', callback_data: `${actions.deleteTask}-${task._id}` },
            {
                text: has ? 'Cancel notification' : 'Notify',
                callback_data: `${has ? actions.cancelRemindTask : actions.remindTask}-${task._id}`
            }
        ]
    ]);
}

const getDate = async (ctx: BotContext) => {
    const { text } = deunionize(ctx.message);
    const date = convertDate(text);
    if (!date) {
        await ctx.reply('Wrong date format, try again:', menuKeyboard);
        ctx.wizard.selectStep(ctx.wizard.cursor);
        return null;
    }
    return date;
}

const readDescription = async (ctx: BotContext) => {
    const { text } = deunionize(ctx.message);
    ctx.scene.session.newTask = {};
    const { newTask } = ctx.scene.session;
    newTask.description = text;
}

const readDateCreateTask = async (ctx: BotContext) => {
    try {
        const date = await getDate(ctx);
        if (!date) return;
        const description = ctx.scene.session.newTask.description;
        const user: DBUser = ctx.session.user;
        await createTask({ userId: user._id, description, date });
        ctx.scene.reenter();
    } catch (e) {
        console.log(e);
        ctx.wizard.selectStep(ctx.wizard.cursor);
        ctx.scene.leave();
    }
}

const selectTask = async (ctx: BotContext) => {
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
            ctx.reply('I don\'t see the task with this id. Please reenter:', menuKeyboard);
            ctx.wizard.selectStep(ctx.wizard.cursor);
            return;
        }
        ctx.reply(taskToString(tasks[taskId]), { reply_markup: makeTaskKeyboard(tasks[taskId]) });
        return ctx.wizard.selectStep(6);
    } else {
        if (ctx.session.tasks) {
            ctx.reply('Wrong format of number', menuKeyboard);
            ctx.wizard.selectStep(ctx.wizard.cursor);
        } else {
            ctx.reply('Refreshing...')
            ctx.scene.reenter();
        }
    }
}

const createTaskNotification = async (ctx: BotContext) => {
    const date = await getDate(ctx);
    if (!date) return;
    const serverDate = new Date(date);
    serverDate.setHours(date.getHours() - 3)
    const { id } = ctx.scene.session.taskNotification;
    const [task]: DBTask[] = ctx.session.tasks.filter(t => t._id == id);
    if (task) {
        notificationManager.addOneTimeJob(id, serverDate, () => {
            ctx.deleteMessage();
            ctx.reply(`🔔 ${task.description}`);
        })
        await ctx.reply('Notification has been added for time:\n' + getFormattedFullDate(date));
        await ctx.scene.reenter();
    }
}

export const tasksScene = new Scenes.WizardScene<BotContext>(
    tasksSceneName,
    async (ctx) => {
        ctx.reply('Select operation:');
        return ctx.wizard.selectStep(0);
    },
    async (ctx) => {
        await readDescription(ctx);
        await ctx.reply(`Date in format ${dateFormat}:`, menuKeyboard);
        return ctx.wizard.next();
    },
    async (ctx) => {
        await readDateCreateTask(ctx);
    },
    async (ctx) => {
        await selectTask(ctx);
    },
    async (ctx) => {
        await createTaskNotification(ctx);
    },
    async (ctx) => {
        return ctx.wizard.next();
    },
    async (ctx) => {
        ctx.scene.reenter();
    }
);

tasksScene.action(new RegExp(`^${actions.deleteTask}-[0-9a-z]*$`), async (ctx) => {
    const taskId = ctx.match[0].split('-')[1];
    await deleteTask(taskId);
    ctx.answerCbQuery('Task has been deleted');
    notificationManager.cancelJob(taskId);
    ctx.deleteMessage();
    ctx.scene.enter(tasksSceneName);
})

tasksScene.action(new RegExp(`^${actions.remindTask}-[0-9a-z]*$`), async (ctx) => {
    const taskId = ctx.match[0].split('-')[1];
    ctx.scene.session.taskNotification = {id: taskId};
    ctx.reply(`Enter date of notification in format ${dateFormat}:`)
    ctx.wizard.selectStep(4);
    ctx.deleteMessage();
    ctx.answerCbQuery();
})

tasksScene.action(new RegExp(`^${actions.cancelRemindTask}-[0-9a-z]*$`), async (ctx) => {
    const taskId = ctx.match[0].split('-')[1];
    const today = new Date();
    today.setMinutes(today.getMinutes() + 1)
    const [task]: DBTask[] = ctx.session.tasks.filter(t => t._id == taskId);
    if (task) {
        notificationManager.cancelJob(taskId)
        ctx.editMessageReplyMarkup(makeTaskKeyboard(task));
    }
    ctx.answerCbQuery('Notification has been cancelled');
})

tasksScene.hears('Add task', async (ctx) => {
    ctx.reply('Enter description: ', menuKeyboard);
    ctx.wizard.selectStep(1);
})

tasksScene.hears('Select task', async (ctx) => {
    if (!ctx.session.tasks || !ctx.session.tasks.length) {
        return ctx.wizard.selectStep(3);
    }
    ctx.reply('Enter number of the task: ', menuKeyboard);
    ctx.wizard.selectStep(3);
})

tasksScene.hears('Menu', async (ctx) => {
    ctx.scene.reenter();
})

tasksScene.hears('leave', async (ctx) => {
    ctx.reply('You have left task service', removeKeyboard);
    ctx.scene.leave();
})

tasksScene.enter(async ctx => {
    await ctx.reply('Your Tasks:', optionsKeyboard);
    if (ctx.session.user) {
        ctx.session.user = await getUserByTelegramId(ctx.from.id);
    }
    const user: DBUser = ctx.session.user;
    ctx.session.tasks = await getTasksByUserId(user._id);
    const tasks: DBTask[] = ctx.session.tasks;
    if (tasks.length) {
        let result = '';
        for (let i = 0; i < tasks.length; i++) {
            result += `${i + 1}. ${taskToString(tasks[i])}\n\n`;
        }
        await ctx.reply(result.trimEnd())
    } else {
        ctx.reply('You have no tasks');
    }
})