import { DBSubscription } from "@/interfaces/interfaces.js";

export const makeOnEnterMessage = async (subscription: DBSubscription) => {
    let message = `Daily weather forecast subscription\n`;
    if (subscription) {
        message += `Your subscription:\n`
        let hours = subscription.time.hours + 3;
        if (hours > 23) {
            hours -= 24;
        }
        message += `City: ${subscription.city}\nTime: ${hours}:${String(subscription.time.minutes).padStart(2, "0")}`;
    } else {
        message += 'You are not subscribed'
    }
    return message
}