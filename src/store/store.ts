import {configureStore, createAsyncThunk, createReducer} from "@reduxjs/toolkit";
import {ReduxGameState} from "./ReduxGameState";
import {fetchGame} from "../atoms";

const initialState = {
    playerSectorPosition: [],
    game: {
        gameId: null,
        game: null,
    }
} as ReduxGameState;

export const setReduxGameId = createAsyncThunk(
    "game/fetchGameStatus",
    async (gameId: string, thunkAPI) => {
        return {
            game: await fetchGame(gameId),
            gameId,
        };
    }
);

const rootReducer = createReducer(initialState, (builder) => {
    builder.addCase(setReduxGameId.fulfilled, (state, action) => {
        return {
            ...state,
            game: action.payload
        };
    });
});

export const store = configureStore({
    reducer: rootReducer
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;