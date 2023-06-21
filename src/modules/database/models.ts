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