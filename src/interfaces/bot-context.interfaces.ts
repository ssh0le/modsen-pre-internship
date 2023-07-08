import mongoose from "mongoose";
import { Context, Scenes, Telegraf } from "telegraf";
import { Update } from "telegraf/types";

import { Coords} from "./index.js";
import { Place } from "./places.interfaces.js";


interface CustomSessionData extends Scenes.WizardSessionData {
    newTask: {
        description?: string,
        date?: Date,
    },
    taskNotification: {
        id: string,
    },
    subscription: {
        id: mongoose.Types.ObjectId | null,
        city: string,
        userId: mongoose.Types.ObjectId,
        chatId: number,
    },
    places: {
        city?: string,
        coords?: Coords,
        keyword?: string,
        type?: string,
        currentPage?: number,
        nextPageToken?: string,
        list?: Place[],
    }
}

export interface BotContext<U extends Update = Update> extends Context<U> {
    session: any;
    scene: Scenes.SceneContextScene<BotContext, CustomSessionData>,
    wizard: Scenes.WizardContextWizard<BotContext>;
}

export type Bot = Telegraf<BotContext>;