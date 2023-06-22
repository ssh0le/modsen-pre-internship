import { DBTask } from "../interfaces.js";
import { getReadableDate } from "../helpers/getReadableDate.js";

export const taskToString = (task: DBTask): string => {
    return `${task.description}\nDate: ${getReadableDate(task.date)}`
}