import { deunionize,Scenes } from "telegraf";

import { ScheduleManager } from "@/classes/scheduleManager.js";
import { menuKeyboard, optionsKeyboard, tasksActions, tasksMessages, tasksOptions, tasksSceneName } from "@/constants/index.js";
import { convertDate, getFormattedFullDate, isInArrayRange, makeTaskKeyboard, taskListToString, taskToString } from "@/helpers/index.js";
import { BotContext, DBTask, DBUser } from "@/interfaces/interfaces.js";
import { createTask, deleteTask, getTasksByUserId, getUserByTelegramId } from "@/services/index.js";

const notificationManager = new ScheduleManager<string>();

const getDate = async (ctx: BotContext) => {
    const { text } = deunionize(ctx.message);
    const date = convertDate(text);
    if (!date) {
        await ctx.reply(tasksMessages.wrongDate, menuKeyboard);
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
            ctx.reply(tasksMessages.wrongTaskId, menuKeyboard);
            ctx.wizard.selectStep(ctx.wizard.cursor);
            return;
        }
        ctx.reply(taskToString(tasks[taskId]), { reply_markup: makeTaskKeyboard(tasks[taskId], notificationManager) });
        return ctx.wizard.selectStep(6);
    } else {
        if (ctx.session.tasks) {
            ctx.reply(tasksMessages.wrongTaskIdFormat, menuKeyboard);
            ctx.wizard.selectStep(ctx.wizard.cursor);
        } else {
            ctx.reply(tasksMessages.refreshing)
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
        await ctx.reply(`${tasksMessages.notificationIsCreated}${getFormattedFullDate(date)}`);
        await ctx.scene.reenter();
    }
}

export const tasksScene = new Scenes.WizardScene<BotContext>(
    tasksSceneName,
    async (ctx) => {
        ctx.reply(tasksMessages.askToSelectOperation);
        return ctx.wizard.selectStep(0);
    },
    async (ctx) => {
        await readDescription(ctx);
        await ctx.reply(tasksMessages.askToEnterDate, menuKeyboard);
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

tasksScene.action(new RegExp(`^${tasksActions.deleteTask}-[0-9a-z]*$`), async (ctx) => {
    const taskId = ctx.match[0].split('-')[1];
    await deleteTask(taskId);
    ctx.answerCbQuery(tasksMessages.taskDeleted);
    notificationManager.cancelJob(taskId);
    ctx.deleteMessage();
    ctx.scene.enter(tasksSceneName);
})

// example: 'REMIND_TASK-542c2b97bac0595474108b48'

tasksScene.action(new RegExp(`^${tasksActions.remindTask}-[0-9a-z]*$`), async (ctx) => {
    const taskId = ctx.match[0].split('-')[1];
    ctx.scene.session.taskNotification = { id: taskId };
    ctx.reply(tasksMessages.askForDate);
    ctx.wizard.selectStep(4);
    ctx.deleteMessage();
    ctx.answerCbQuery();
})

// example: 'CANCEL_REMIND_TASK-542c2b97bac0595474108b48'

tasksScene.action(new RegExp(`^${tasksActions.cancelRemindTask}-[0-9a-z]*$`), async (ctx) => {
    const taskId = ctx.match[0].split('-')[1];
    const today = new Date();
    today.setMinutes(today.getMinutes() + 1)
    const [task]: DBTask[] = ctx.session.tasks.filter(t => t._id == taskId);
    if (task) {
        notificationManager.cancelJob(taskId)
        ctx.editMessageReplyMarkup(makeTaskKeyboard(task, notificationManager));
    }
    ctx.answerCbQuery(tasksMessages.notificationCanceled);
})

tasksScene.hears(tasksOptions.addTask, async (ctx) => {
    ctx.reply(tasksMessages.askToEnterDescription, menuKeyboard);
    ctx.wizard.selectStep(1);
})

tasksScene.hears(tasksOptions.selectTask, async (ctx) => {
    if (!ctx.session.tasks || !ctx.session.tasks.length) {
        ctx.reply(tasksMessages.noTaskToChoose);
        ctx.scene.reenter();
        return;
    }
    ctx.reply(tasksMessages.askToSelectTask, menuKeyboard);
    ctx.wizard.selectStep(3);
})

tasksScene.hears(tasksOptions.menu, async (ctx) => {
    ctx.scene.reenter();
})

tasksScene.enter(async ctx => {
    await ctx.reply(tasksMessages.onenter);
    await ctx.reply(tasksMessages.listHeader, optionsKeyboard);
    if (ctx.session.user) {
        ctx.session.user = await getUserByTelegramId(ctx.from.id);
    }
    const user: DBUser = ctx.session.user;
    ctx.session.tasks = await getTasksByUserId(user._id);
    const tasks: DBTask[] = ctx.session.tasks;
    if (tasks.length) {
        await ctx.reply(taskListToString(tasks).trimEnd())
    } else {
        ctx.reply(tasksMessages.noTask);
    }
})