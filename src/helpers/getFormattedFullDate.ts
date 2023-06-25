export const getFormattedFullDate = (date: Date) => {
    return date.toLocaleString('en-US', {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    })
}