import { Place } from "@/interfaces/index.js"

export const hasResults = (places: Place[] | null) => {
    return !places || !places.length
}
