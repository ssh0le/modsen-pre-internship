import { DBTask } from "@/interfaces/index.js"

import { getReadableDate } from "./index.js"

export const taskToString = (task: DBTask): string => {
    return `${task.description}\nDate: ${getReadableDate(task.date)}`
}