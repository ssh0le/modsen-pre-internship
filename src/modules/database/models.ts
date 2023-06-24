import mongoose from "mongoose";

export const User = mongoose.model('User', new mongoose.Schema({
    name: String,
    telegramId: Number,
    city: String,
}))

export const Task = mongoose.model('Task', new mongoose.Schema({
    description: String,
    date: Date,
    userId: mongoose.SchemaTypes.ObjectId,
}))

export const Subscription = mongoose.model('Subscription', new mongoose.Schema({
    userId: {type: mongoose.SchemaTypes.ObjectId, ref: 'User'},
    time: {hours: Number, minutes: Number},
    city: String,
    chatId: Number,
}))