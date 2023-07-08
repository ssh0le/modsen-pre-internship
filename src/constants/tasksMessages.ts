import { dateFormat } from "./index.js";

export const tasksMessages = {
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