import { DBTask } from "@/interfaces/database.interface.js";
import { taskToString } from "./index.js";

export const taskListToString = (tasks: DBTask[]) => {
    let result = '';
    for (let i = 0; i < tasks.length; i++) {
        result += `${i + 1}. ${taskToString(tasks[i])}\n\n`;
    }
    return result;
}