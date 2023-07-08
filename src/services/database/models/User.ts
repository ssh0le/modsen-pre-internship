import mongoose from "mongoose";

export const User = mongoose.model('User', new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 1,
        validate: {
            validator: (value: string) => value != null,
            message: (props: { value: string }) => `${props.value} is incorrect name`
        }
    },
    telegramId: {
        type: Number,
        validate: {
            validator: (value: number) => Number.isInteger(value) && value > 0,
            message: (props: { value: number }) => `${props.value} is incorrect telegram id!`
        },
        required: true,
    },
    city: {
        type: String,
        validate: {
            validator: (value: string) => value === undefined || value.length > 1,
            message: (props: { value: string }) => `${props.value} is incorrect city name`
        },
    },
}, {id: true}))