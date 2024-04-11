import {configureStore, createReducer} from "@reduxjs/toolkit";
import {ReduxGameState} from "./ReduxGameState";
import {registerPlayerSectorPosition} from "./playerSectorPosition";
import {registerTheoriesReducer} from "./theories";
import {registerTopRowsReducer} from "./topRows";
import {bottomInitialRows, registerBottomRowsReducer} from "./bottomRows";
import {BuilderProxy} from "./BuilderProxy";
import {createInitialMap, registerMapReducer} from "./map";
import {registerBotReducer} from "./bot";
import {setReduxGameId} from "./setReduxGameId";
import {localStorageEnhancer} from "./localStorageEnhancer";

const initialState = {
    playerSectorPosition: [[0, 1, 2, 3]],
    game: {
        gameId: null,
        game: null,
    },
    playerCount: 4,
    gameSize: 18,
    theories: [],
    topRows: [{action: "", p2: "", p3: "", p4: "", id: 1, result: ""}],
    bottomRows: bottomInitialRows(),
    map: createInitialMap(),
    nextBotAction: 0,
} as ReduxGameState;

const rootReducer = createReducer(initialState, (builder) => {
    builder.addCase(setReduxGameId.fulfilled, (state, action) => {
        return {
            ...state,
            game: action.payload,
        };
    });
    const builderProxy = new BuilderProxy(builder);
    registerPlayerSectorPosition(builderProxy);
    registerTheoriesReducer(builderProxy);
    registerTopRowsReducer(builderProxy);
    registerBottomRowsReducer(builderProxy);
    registerMapReducer(builderProxy);
    registerBotReducer(builderProxy);
    builderProxy.build();
});
export function createAppStore() {
    return configureStore({
        reducer: rootReducer,
        enhancers: (getDefaultEnhancers) => getDefaultEnhancers().concat([localStorageEnhancer("planetXReduxData")])
    });
}
export type AppDispatch = ReturnType<typeof createAppStore>['dispatch'];