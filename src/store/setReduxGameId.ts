import {createAsyncThunk} from "@reduxjs/toolkit";
import {fetchGame} from "../atoms";

export const setReduxGameId = createAsyncThunk(
    "game/fetchGameStatus",
    async (gameId: string, thunkAPI) => {
        return {
            game: await fetchGame(gameId),
            gameId,
        };
    }
);