import {Game, ObjectType} from "../Game";
import {BottomRowModel, TopRowModel} from "../tableState";
import {Sector} from "../NoteWheel";

export interface CompatTheoryObj {
    self: [sector: number, type: ObjectType, verified: boolean][];
    p2: [sector: number, type: ObjectType, verified: boolean][];
    p3: [sector: number, type: ObjectType, verified: boolean][];
    p4: [sector: number, type: ObjectType, verified: boolean][];
}

export interface Theory {
    sector: number;
    type: ObjectType;
    verified: boolean;
}
export type TheoryRow = Theory[][];

export interface ReduxGameState {
    playerSectorPosition: number[][];
    game: {
        gameId: string;
        game: Game;
    } | {
        gameId: null;
        game: null;
    };
    gameSize: 12 | 18;
    theories: TheoryRow[];
    topRows: TopRowModel[];
    bottomRows: BottomRowModel[];
    map: Sector[];
    nextBotAction: number;
}