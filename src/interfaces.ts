import { Context, NarrowedContext } from "telegraf";
import { Message, Update } from "telegraf/types";

export interface CatPhoto {
    id: string,
    url: string,
}

export interface DogPhoto {
    message: string,
    status: string,
}

export type BotContext = NarrowedContext<Context<Update>, {
    message: Update.New & Update.NonChannel & Message.TextMessage;
    update_id: number;
}>;