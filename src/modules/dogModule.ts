import axios from "axios";
import { DogPhoto } from "interfaces.js";
import * as dotenv from 'dotenv';
import { Context } from "telegraf";

dotenv.config()

const dogApiUrl = process.env.DOG_API_URL as string

export const sendDogPhoto = async (ctx: Context) => {
    try {
        const response = await axios.get<DogPhoto>(dogApiUrl);
        if (response.data.status === 'success') {
            ctx.replyWithPhoto(response.data.message);
        } else {
            throw response.data.status;
        }
    } catch (e) {   
        ctx.reply('Failed to upload dog photo',);
    }
}