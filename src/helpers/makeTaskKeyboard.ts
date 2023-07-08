import { ScheduleManager } from "@/classes/scheduleManager.js";
import { tasksActions, tasksOptions } from "@/constants/index.js";
import { DBTask } from "@/interfaces/index.js";

import { createInlineKeyboard } from "./createInlineKeyboard.js";

export const makeTaskKeyboard = (task: DBTask, notificationManager: ScheduleManager<string>) => {
    const has = notificationManager.hasJob(task.id.toString());
    return createInlineKeyboard([
        [
            { text: tasksOptions.delete, callback_data: `${tasksActions.deleteTask}-${task.id}` },
            {
                text: has ? tasksOptions.cancelNotification : tasksOptions.notification,
                callback_data: `${has ? tasksActions.cancelRemindTask : tasksActions.remindTask}-${task.id}`
            }
        ]
    ]);
}