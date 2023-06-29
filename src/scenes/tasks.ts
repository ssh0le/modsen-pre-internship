import { ScheduleManager } from "@/classes/scheduleManager.js";
import { BotContext, DBTask, DBUser } from "@/interfaces/interfaces.js";
import { Markup, Scenes, deunionize } from "telegraf";
import { convertDate, createInlineKeyboard, getFormattedFullDate, isInArrayRange, taskListToString, taskToString } from "@/helpers/index.js";
import { createTask, deleteTask, getTasksByUserId, getUserByTelegramId } from "@/modules/database/database.js";
export const tasksSceneName = 'TASKS'

const notificationManager = new ScheduleManager<string>();

const dateFormat = "DD/MM/YYYY HH:MM";

const actions = {
    deleteTask: 'DELETE_TASK',
    remindTask: 'REMIND_TASK',
    cancelRemindTask: 'CANCEL_REMIND_TASK'
}

const messages = {
    onenter: 'Type /leave to leave from service',
    wrongDate: 'Wrong date format, try again:',
    listHeader: 'Your Tasks:',
    wrongTaskId: 'I don\'t see the task with this id. Please reenter:',
    wrongTaskIdFormat: 'Wrong format of number, please reenter:',
    refreshing: 'Refreshing...',
    notificationIsCreated: 'Notification has been added for this date:\n',
    askToSelectOperation: 'Select operation',
    askToEnterDate: `Enter date in format ${dateFormat}:`,
    taskDeleted: 'Task has been deleted',
    askForDate: `Enter date of notification in format ${dateFormat}:`,
    notificationCanceled: 'Notification has been cancelled',
    askToEnterDescription: 'Enter description: ',
    noTaskToChoose: 'You don\'t have tasks to choose from',
    noTask: 'You have no tasks',
    askToSelectTask: 'Enter number of the task: ',
}

const options = {
    addTask: 'Add task',
    selectTask: 'Select task',
    menu: 'Menu',
}

const optionsKeyboard = Markup.keyboard([
    [options.addTask],
    [options.selectTask],
    ['leave'],
]).oneTime().resize();

const menuKeyboard = Markup.keyboard([
    ['Menu'],
]).oneTime().resize();

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
        await ctx.reply(messages.wrongDate, menuKeyboard);
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
        ctx.wizard.selectStep(ctx.wizard.cursor);
        ctx.scene.leave();
    }
}

const selectTask = async (ctx: BotContext) => {
    const { text } = deunionize(ctx.message);
    const taskId = parseInt(text) - 1;
    if (Number.isInteger(taskId) && ctx.session.tasks) {
        const tasks: DBTask[] = ctx.session.tasks;
        if (!isInArrayRange(taskId, tasks.length)) {
            ctx.reply(messages.wrongTaskId, menuKeyboard);
            ctx.wizard.selectStep(ctx.wizard.cursor);
            return;
        }
        ctx.reply(taskToString(tasks[taskId]), { reply_markup: makeTaskKeyboard(tasks[taskId]) });
        return ctx.wizard.selectStep(6);
    } else {
        if (ctx.session.tasks) {
            ctx.reply(messages.wrongTaskIdFormat, menuKeyboard);
            ctx.wizard.selectStep(ctx.wizard.cursor);
        } else {
            ctx.reply(messages.refreshing)
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
        await ctx.reply(`${messages.notificationIsCreated}${getFormattedFullDate(date)}`);
        await ctx.scene.reenter();
    }
}

export const tasksScene = new Scenes.WizardScene<BotContext>(
    tasksSceneName,
    async (ctx) => {
        ctx.reply(messages.askToSelectOperation);
        return ctx.wizard.selectStep(0);
    },
    async (ctx) => {
        await readDescription(ctx);
        await ctx.reply(messages.askToEnterDate, menuKeyboard);
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

// Following regexp's describe 'Type of action' and 'Task id' like that: `${typeOfAction}-${taskId}` 

// example: 'DELETE_TASK-542c2b97bac0595474108b48'

tasksScene.action(new RegExp(`^${actions.deleteTask}-[0-9a-z]*$`), async (ctx) => {
    const taskId = ctx.match[0].split('-')[1];
    await deleteTask(taskId);
    ctx.answerCbQuery(messages.taskDeleted);
    notificationManager.cancelJob(taskId);
    ctx.deleteMessage();
    ctx.scene.enter(tasksSceneName);
})

// example: 'REMIND_TASK-542c2b97bac0595474108b48'

tasksScene.action(new RegExp(`^${actions.remindTask}-[0-9a-z]*$`), async (ctx) => {
    const taskId = ctx.match[0].split('-')[1];
    ctx.scene.session.taskNotification = { id: taskId };
    ctx.reply(messages.askForDate);
    ctx.wizard.selectStep(4);
    ctx.deleteMessage();
    ctx.answerCbQuery();
})

// example: 'CANCEL_REMIND_TASK-542c2b97bac0595474108b48'

tasksScene.action(new RegExp(`^${actions.cancelRemindTask}-[0-9a-z]*$`), async (ctx) => {
    const taskId = ctx.match[0].split('-')[1];
    const today = new Date();
    today.setMinutes(today.getMinutes() + 1)
    const [task]: DBTask[] = ctx.session.tasks.filter(t => t._id == taskId);
    if (task) {
        notificationManager.cancelJob(taskId)
        ctx.editMessageReplyMarkup(makeTaskKeyboard(task));
    }
    ctx.answerCbQuery(messages.notificationCanceled);
})

tasksScene.hears(options.addTask, async (ctx) => {
    ctx.reply(messages.askToEnterDescription, menuKeyboard);
    ctx.wizard.selectStep(1);
})

tasksScene.hears(options.selectTask, async (ctx) => {
    if (!ctx.session.tasks || !ctx.session.tasks.length) {
        ctx.reply(messages.noTaskToChoose);
        ctx.scene.reenter();
        return;
    }
    ctx.reply(messages.askToSelectTask, menuKeyboard);
    ctx.wizard.selectStep(3);
})

tasksScene.hears(options.menu, async (ctx) => {
    ctx.scene.reenter();
})

tasksScene.enter(async ctx => {
    ctx.reply(messages.onenter);
    await ctx.reply(messages.listHeader, optionsKeyboard);
    if (ctx.session.user) {
        ctx.session.user = await getUserByTelegramId(ctx.from.id);
    }
    const user: DBUser = ctx.session.user;
    ctx.session.tasks = await getTasksByUserId(user._id);
    const tasks: DBTask[] = ctx.session.tasks;
    if (tasks.length) {
        await ctx.reply(taskListToString(tasks).trimEnd())
    } else {
        ctx.reply(messages.noTask);
    }
})