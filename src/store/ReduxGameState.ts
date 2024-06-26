import {Game, ObjectType} from "../Game";
import {BottomRowModel, TopRowModel} from "../tableState";
import {Sector} from "../NoteWheel";
import {WorkingTheoriesState} from "./workingTheories";

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
    playerCount: number;
    gameSize: 12 | 18;
    theories: TheoryRow[];
    topRows: TopRowModel[];
    bottomRows: BottomRowModel[];
    map: Sector[];
    nextBotAction: number;
    workingTheories: WorkingTheoriesState;
}