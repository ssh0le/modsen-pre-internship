import { Markup } from "telegraf";

export const makeTypesMenu = (types: string[]) => {
    const columnNumber = 2;
    const keyboardSchema = types.reduce<string[][]>((schema, type, i) => {
        if (i % columnNumber === 0) {
            schema.push([type]);
        } else {
            schema.at(-1).push(type);
        }
        return schema;
    }, []);
    return Markup.keyboard(keyboardSchema).resize().oneTime();
}