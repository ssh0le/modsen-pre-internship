import axios from 'axios';
import { CatPhoto } from '@/interfaces/interfaces.js';
import { Context } from 'telegraf';
import { catApiUrl } from '@/config.js';

const messages = {
    fetchError: 'Fetching cat photo error',
}

export const sendCatPhoto = async (ctx: Context) => {
    try {
        const response = await axios.get<CatPhoto[]>(catApiUrl);
        await ctx.replyWithPhoto(response.data[0].url);
    } catch (e) {
        ctx.reply(messages.fetchError)
    }
};