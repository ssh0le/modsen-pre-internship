export const tryCatchWrapper = async <T>(func: () => Promise<T>) => {
    try {
        return await func;
    }
    catch (e) {
        return null
    }
}