import mongoose, { ObjectId } from "mongoose";
import * as dotenv from 'dotenv';
import { Task, User } from "./models.js";
import { DBTask, DBUser } from "interfaces.js";


dotenv.config()

const url = process.env.DB_URL as string;

mongoose.connect(url);

export async function getUserByTelegramId(id: number) {
    try {
        const user = await User.findOne<DBUser>({telegramId: id});
        return user;
    } catch (e) {
        console.log(e);
        return null;
    }
}

export async function createUser({telegramId, name, city}:{telegramId: number, name: string, city: string | undefined}) {
    try {
        const user = await User.create({
            name,
            telegramId,
            city: city ? city : null,
        });
        console.log(user);
    } catch (e) {

    }
}

export async function getTasksByUserId (id: ObjectId){
    const tasks = await Task.find<DBTask>({
        userId: id,
    })
    return tasks;
}

export async function createTask ({userId, date, description}: {userId: ObjectId, date: Date, description: string}) {
    const task = Task.create({
        userId,
        date,
        description,
    })
    console.log(task);
}

export async function deleteTask (taskId: string) {
    Task.deleteOne({
        _id: taskId,
    }).then(res => console.log(res));
}