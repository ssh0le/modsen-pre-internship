import mongoose, { ObjectId } from "mongoose";

import { isValidName } from "@/helpers/isValidCityName.js";
import { Time } from "@/interfaces/index.js";

export const Subscription = mongoose.model('Subscription', new mongoose.Schema({
    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        validate: {
            validator: (value: ObjectId) => mongoose.isValidObjectId(value),
            message: (props: { value: ObjectId }) => `${props.value} is not correct user id!`
        },
        required: true,
    },
    time: {
        type: {
            hours: {
                type: Number,
                required: true,
            }, minutes: {
                type: Number,
                required: true,
            }
        },
        validate: {
            validator: (time: Time) => time,
            message: (props: { value: Time }) => `${props.value.hours}:${props.value.minutes} is not correct time!`
        },
        required: true,
    },
    city: {
        type: String,
        required: true,
        validate: {
            validator: (value: string) => value.length > 0 && isValidName(value),
            message: (props: { value: string }) => `${props.value} is not correct city name!`
        },
    },
    chatId: {
        type: Number,
        validate: {
            validator: (value: number) => Number.isInteger(value) && value > 0,
            message: (props: { value: number }) => `${props.value} is incorrect telegram id!`
        },
        required: true,
    },
}, {id: true}))