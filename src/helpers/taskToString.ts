import { DBTask } from "../interfaces/interfaces.js";
import { getReadableDate } from "./getReadableDate.js";

export const taskToString = (task: DBTask): string => {
    return `${task.description}\nDate: ${getReadableDate(task.date)}`
}