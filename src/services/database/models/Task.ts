import mongoose from "mongoose";

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
        type: mongoose.SchemaTypes.ObjectId,
        validate: {
            validator: (value: mongoose.Types.ObjectId) => mongoose.Types.ObjectId.isValid(value),
            message: (props: {value: mongoose.Types.ObjectId}) => `${props.value} is not correct user id!`
        },
        required: true,
    },
}))