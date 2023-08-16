export enum ObjectType {
    EMPTY,
    ASTEROID,
    DWARF_PLANET,
    COMET,
    GAS_CLOUD,
    PLANET_X = 9,
    BOT = 10,
    PLAYER = 11,
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
    }};
    solo?: {
        turns: Array<BotActionSurvey | BotActionTarget | BotActionLocate | BotActionResearch>;
        theories: Array<{sector: number; time: number}>;
    };
}

interface BotActionSurvey {
    action: ObjectType;
    x: number;
    y: number;
    time: number;
}
interface BotActionTarget {
    action: "T";
    sector: number;
    time: number;
}
interface BotActionLocate {
    action: "X";
    time: number;
}
interface BotActionResearch {
    action: "R";
    conf: string;
    time: number;
}