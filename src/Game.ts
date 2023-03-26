export enum ObjectType {
    EMPTY,
    ASTEROID,
    DWARF_PLANET,
    COMET,
    GAS_CLOUD,
    PLANET_X = 9,
    BOT = 10,
}
export type ConferenceKey = "A" | "B" | "C" | "D" | "E" | "F" | "X1" | "X2";
export interface Game {
    obj: {[key: number]: ObjectType};
    conf: {[key in ConferenceKey]: {
        title: [ObjectType] | [ObjectType, ObjectType];
        body: {
            type: string;
            X?: ObjectType;
            Y?: ObjectType;
            N?: number;
        }
    }}
}