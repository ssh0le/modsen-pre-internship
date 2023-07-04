import mongoose from "mongoose";

import { dbUrl } from "@/config.js";
import { tryCatchWrapper } from "@/helpers/tryCatchWrapper.js";
import { DBSubscription, DBTask, DBUser, Time } from "@/interfaces/interfaces.js";

import { Subscription,Task, User } from "./models/index.js";

mongoose.connect(dbUrl);

export async function getUserByTelegramId(id: number) {
    return await tryCatchWrapper<DBUser>(User.findOne<DBUser>({ telegramId: id }))
}

export async function createUser({ telegramId, name, city }: { telegramId: number, name: string, city: string | undefined }) {
    return await tryCatchWrapper(User.create({
        name,
        telegramId,
        city: city ? city : null,
    }))
}

export async function getTasksByUserId(id: mongoose.Types.ObjectId) {
    return await tryCatchWrapper(Task.find<DBTask>({
        userId: id,
    }))
}

export async function createTask({ userId, date, description }: { userId: mongoose.Types.ObjectId, date: Date, description: string }) {
    Task.create({
        userId,
        date,
        description,
    })
}

export async function deleteTask(taskId: string) {
    return await tryCatchWrapper(Task.deleteOne({
        _id: taskId,
    }));
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

export async function getAllSubscriptions() {
   return await tryCatchWrapper(Subscription.find<DBSubscription>({}).populate<DBUser>('userId'));
}