import {Game, ObjectType} from "../Game";
import {TopRowModel} from "../tableState";

export interface ReduxTheoryObj {
    self: [sector: number, type: ObjectType, verified: boolean][];
    p2: [sector: number, type: ObjectType, verified: boolean][];
    p3: [sector: number, type: ObjectType, verified: boolean][];
    p4: [sector: number, type: ObjectType, verified: boolean][];
}

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
    theories: ReduxTheoryObj[];
    topRows: TopRowModel[];
}