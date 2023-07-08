import mongoose from "mongoose";

import { Time } from "./index.js";

export interface DBUser {
    id: mongoose.Types.ObjectId,
    telegramId: string,
    name: string,
    city: string,
}

export interface DBTask {
    id: mongoose.Types.ObjectId,
    description: string,
    userId: string,
    date: Date,
}

export interface DBSubscription {
    id?: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    time: Time,
    city: string,
    chatId: number,
}