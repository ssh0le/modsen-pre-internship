import mongoose from "mongoose";
import * as dotenv from 'dotenv';
import { Task, User, Subscription } from "./models.js";
import { DBSubscription, DBTask, DBUser, Time } from "../../interfaces.js";


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
        await User.create({
            name,
            telegramId,
            city: city ? city : null,
        });
    } catch (e) {

    }
}

export async function getTasksByUserId (id: mongoose.Types.ObjectId){
    const tasks = await Task.find<DBTask>({
        userId: id,
    })
    return tasks;
}

export async function createTask ({userId, date, description}: {userId: mongoose.Types.ObjectId, date: Date, description: string}) {
    Task.create({
        userId,
        date,
        description,
    })
}

export async function deleteTask (taskId: string) {
    Task.deleteOne({
        _id: taskId,
    });
}

export async function getSubscription (userId: mongoose.Types.ObjectId) {
    try {
        const subscription = await Subscription.findOne<DBSubscription>({
            userId,
        })
        return subscription;
    } catch(e) {
        return null
    }
}

export async function createSubscription (userId: mongoose.Types.ObjectId, time:Time, city: string, chatId: number) {
    try {
        const sub = await Subscription.create<DBSubscription>({
            userId,
            time,
            city,
            chatId,
        })
        return sub;
    } catch (e) {
        return null;
    }
}

export async function deleteSubscription (subscriptionId: mongoose.Types.ObjectId) {
    try {
        Subscription.deleteOne({
            _id: subscriptionId,
        })
    } catch(e) {
        return null
    }
}

export async function getAllSubscribtions () {
    try {
        const subs = await Subscription.find<DBSubscription>({}).populate<DBUser>('userId');
        return subs;
    } catch (e) {
        console.log(e);
    }
}