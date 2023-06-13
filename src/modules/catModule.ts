import axios from 'axios';
import * as dotenv from 'dotenv';
import { CatPhoto } from 'interfaces.js';
import { Context } from 'telegraf';

dotenv.config()

const catApiUrl = process.env.CAT_API_URL as string;

export const sendCatPhoto = async (ctx: Context) => {
    try {
        const response = await axios.get<CatPhoto[]>(catApiUrl);
        ctx.replyWithPhoto(response.data[0].url);
    } catch (e) {
        ctx.reply('Fetching cat photo error')
    }
  };