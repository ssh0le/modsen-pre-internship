import axios from "axios";
import { Context } from "telegraf";

import { dogApiUrl } from "@/config.js";
import { dogModuleMessages } from "@/constants/index.js";
import { DogPhoto } from "@/interfaces/interfaces.js";

export const sendDogPhoto = async (ctx: Context) => {
    try {
        const response = await axios.get<DogPhoto>(dogApiUrl);
        if (response.data.status === 'success') {
            await ctx.replyWithPhoto(response.data.message);
        } else {
            throw response.data.status;
        }
    } catch (e) {
        await ctx.reply(dogModuleMessages.fetchError);
    }
}