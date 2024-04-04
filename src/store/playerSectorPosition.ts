import {ActionReducerMapBuilder, createAction, createSelector, current} from "@reduxjs/toolkit";
import {ReduxGameState} from "./ReduxGameState";
import {sectorClamp} from "../atoms";


export const recoilSectorStateSelector = createSelector([(state: ReduxGameState) => state.playerSectorPosition, (state: ReduxGameState) => state.gameSize], (sectors, gameSize) => {
    return sectorClamp(sectors.findIndex((item) => item.includes(0)) + 1, gameSize);
});

export const recoilPlayerPositionStateSelector = createSelector([(state: ReduxGameState) => state.playerSectorPosition, (state: ReduxGameState) => state.gameSize], (sectors, gameSize) => {
    return [1, 2, 3].map((playerID) => sectorClamp(sectors.findIndex((item) => item.includes(playerID)) + 1, gameSize)) as [number, number, number];
});

export const availableSectorsSelector = createSelector([recoilSectorStateSelector], (startSector) => {
    return new Array(9).fill(0).map((_, i) => sectorClamp(startSector + i));
});

export const updatePlayerPosition = createAction<[player: number, sector: number]>('playerSectorPosition/set');
export const adjustPlayerPosition = createAction<[player: number, amount: number]>('playerSectorPosition/adjust');
function setPlayerPositionAction(state: ReduxGameState, action: ReturnType<typeof updatePlayerPosition>): void {
    let [player, sector] = action.payload;
    if (sector <= 0) sector = sectorClamp(sector, state.gameSize);
    while (sector > state.playerSectorPosition.length) {
        state.playerSectorPosition.push([]);
    }
    for (let i = 0; i < state.playerSectorPosition.length; i++){
        const item = state.playerSectorPosition[i];
        if (item.includes(player)) {
            item.splice(item.indexOf(player), 1);
        }
        if (i + 1 === sector) {
            item.push(player);
        }
    }
}
export function adjustPlayerPositionReducer(state: ReduxGameState, action: ReturnType<typeof adjustPlayerPosition>): void {
    setPlayerPositionAction(state, updatePlayerPosition([
        action.payload[0],
        action.payload[1] + state.playerSectorPosition.findIndex((item) => item.includes(action.payload[0])) + 1
    ]));
}
export function registerPlayerSectorPosition(builder: ActionReducerMapBuilder<ReduxGameState>) {
    builder.addCase(adjustPlayerPosition, adjustPlayerPositionReducer);
    builder.addCase(updatePlayerPosition, setPlayerPositionAction);
}