import axios from 'axios';
import { Context } from 'telegraf';

import { catApiUrl } from '@/config.js';
import { catModuleMessages as messages } from '@/constants/index.js';
import { CatPhoto } from '@/interfaces/index.js';

export const sendCatPhoto = async (ctx: Context) => {
    try {
        const response = await axios.get<CatPhoto[]>(catApiUrl);
        await ctx.replyWithPhoto(response.data[0].url);
    } catch (e) {
        ctx.reply(messages.fetchError)
    }
};