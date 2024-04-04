import {Game} from "../Game";

export interface ReduxGameState {
    playerSectorPosition: number[][];
    game: {
        gameId: string;
        game: Game;
    } | {
        gameId: null;
        game: null;
    };
}