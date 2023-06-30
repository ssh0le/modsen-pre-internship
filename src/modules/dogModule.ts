import axios from "axios";
import { DogPhoto } from "@/interfaces/interfaces.js";
import { Context } from "telegraf";
import { dogApiUrl } from "@/config.js";

const messages = {
    fetchError: 'Failed to upload dog photo',
}

export const sendDogPhoto = async (ctx: Context) => {
    try {
        const response = await axios.get<DogPhoto>(dogApiUrl);
        if (response.data.status === 'success') {
            await ctx.replyWithPhoto(response.data.message);
        } else {
            throw response.data.status;
        }
    } catch (e) {
        await ctx.reply(messages.fetchError);
    }
}