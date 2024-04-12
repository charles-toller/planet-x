import {
    ActionReducerMapBuilder,
    configureStore,
    createReducer,
    original,
    Slice,
    SliceCaseReducers
} from "@reduxjs/toolkit";
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
import {workingTheories} from "./workingTheories";

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
    workingTheories: workingTheories.getInitialState(),
    nextBotAction: 0,
} as ReduxGameState;

function registerSliceReducer<SliceState, SliceName extends string, OverallState extends {[key in SliceName]: SliceState}>(slice: Slice<SliceState, SliceCaseReducers<SliceState>, SliceName>, builder: ActionReducerMapBuilder<OverallState>) {
    builder.addMatcher(() => true, (draftState, action) => {
        // @ts-ignore
        const state: OverallState = original(draftState);
        const newValue = slice.reducer(state[slice.reducerPath], action);
        if (newValue !== state[slice.reducerPath]) {
            // @ts-ignore
            draftState[slice.reducerPath] = newValue;
        }
    });
}

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
    registerSliceReducer(workingTheories, builderProxy);
    builderProxy.build();
});
export function createAppStore() {
    return configureStore({
        reducer: rootReducer,
        enhancers: (getDefaultEnhancers) => getDefaultEnhancers().concat([localStorageEnhancer("planetXReduxData")])
    });
}
export type AppDispatch = ReturnType<typeof createAppStore>['dispatch'];