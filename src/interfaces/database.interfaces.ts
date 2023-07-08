import mongoose from "mongoose";

import { Time } from "./index.js";

export interface DBUser {
    _id: mongoose.Types.ObjectId,
    telegramId: string,
    name: string,
    city: string,
}

export interface DBTask {
    _id: mongoose.Types.ObjectId,
    description: string,
    userId: string,
    date: Date,
}

export interface DBSubscription {
    _id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    time: Time,
    city: string,
    chatId: number,
}