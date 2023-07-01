import mongoose from "mongoose";
import { Task, User, Subscription } from "./models/index.js";
import { DBSubscription, DBTask, DBUser, Time } from "@/interfaces/interfaces.js";
import { dbUrl } from "@/config.js";
import { tryCatchWrapper } from "@/helpers/tryCatchWrapper.js";

mongoose.connect(dbUrl);

export async function getUserByTelegramId(id: number) {
    return await tryCatchWrapper<DBUser>(User.findOne<DBUser>({ telegramId: id }))
}

export async function createUser({ telegramId, name, city }: { telegramId: number, name: string, city: string | undefined }) {
    try {
        await User.create({
            name,
            telegramId,
            city: city ? city : null,
        });
    } catch (e) {

    }
}

export async function getTasksByUserId(id: mongoose.Types.ObjectId) {
    const tasks = await Task.find<DBTask>({
        userId: id,
    })
    return tasks;
}

export async function createTask({ userId, date, description }: { userId: mongoose.Types.ObjectId, date: Date, description: string }) {
    Task.create({
        userId,
        date,
        description,
    })
}

export async function deleteTask(taskId: string) {
    try {
        await Task.deleteOne({
            _id: taskId,
        });
    } catch (e) {
        console.log(e);
    }
}

export async function getSubscription(userId: mongoose.Types.ObjectId) {
    return await tryCatchWrapper<DBSubscription>(
        Subscription.findOne<DBSubscription>({
            userId
        })
    )
}

export async function createSubscription(userId: mongoose.Types.ObjectId, time: Time, city: string, chatId: number) {
    return await tryCatchWrapper<DBSubscription>(Subscription.create<DBSubscription>({
        userId,
        time,
        city,
        chatId,
    }))
}

export async function deleteSubscription(subscriptionId: mongoose.Types.ObjectId) {
    await Subscription.deleteOne({
        _id: subscriptionId.toString(),
    })
}

export async function getAllSubscribtions() {
    try {
        const subs = await Subscription.find<DBSubscription>({}).populate<DBUser>('userId');
        return subs;
    } catch (e) {
        console.log(e);
    }
}