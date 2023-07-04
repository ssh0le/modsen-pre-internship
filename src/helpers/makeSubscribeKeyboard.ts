import { subscriptionActions as actions } from "@/constants/index.js"

import { createInlineKeyboard } from "./index.js"

export const makeSubscribeKeyboard = (isSub: boolean) => {
    return createInlineKeyboard([[
        {
            text: isSub ? 'Unsubscribe' : 'Subscribe',
            callback_data: isSub ? actions.unsubscribe : actions.subscribe
        },
    ]])
}