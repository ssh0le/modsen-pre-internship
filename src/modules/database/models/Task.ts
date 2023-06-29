import mongoose, { ObjectId } from "mongoose";

export const Task = mongoose.model('Task', new mongoose.Schema({
    description: {
        type: String,
        minlength: 1,
        required: true,
    },
    date: {
        type: Date,
        validate: {
            validator: (value: Date) => value != null && value > new Date(),
            message: (props: {value: Date}) => `${props.value} is incorrect date format`
        },
        required: true,
    },
    userId: {
        validate: {
            validator: (value: ObjectId) => mongoose.isValidObjectId(value),
            message: (props: {value: ObjectId}) => `${props.value} is not correct user id!`
        },
        required: true,
    },
}))