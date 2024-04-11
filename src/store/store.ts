import {configureStore, createAsyncThunk, createReducer} from "@reduxjs/toolkit";
import {ReduxGameState} from "./ReduxGameState";
import {fetchGame} from "../atoms";
import {registerPlayerSectorPosition} from "./playerSectorPosition";
import {registerTheoriesReducer} from "./theories";
import {registerTopRowsReducer} from "./topRows";

const initialState = {
    playerSectorPosition: [[0, 1, 2, 3]],
    game: {
        gameId: null,
        game: null,
    },
    gameSize: 18,
    theories: [],
    topRows: [{action: "", p2: "", p3: "", p4: "", id: 1, result: ""}]
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
            game: action.payload,
        };
    });
    registerPlayerSectorPosition(builder);
    registerTheoriesReducer(builder);
    registerTopRowsReducer(builder);
});

export const store = configureStore({
    reducer: rootReducer
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;