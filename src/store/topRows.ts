import {ActionReducerMapBuilder, createAction} from "@reduxjs/toolkit";
import {ReduxGameState} from "./ReduxGameState";
import {adjustPlayerPosition, adjustPlayerPositionReducer} from "./playerSectorPosition";
import {playerNameToId} from "./theories";
import {TopRowModel} from "../tableState";

export const playerTextEnterAction = createAction<{player: 'p2' | 'p3' | 'p4'; text: string; rowId: number}>("topRows/playerTextEnter");
export const setAction = createAction<{action: string; result: string; sectors: number}>("topRows/setAction");

export const topRowsSelector = (state: ReduxGameState) => state.topRows;

const surveyReg = /^\s*([egdac])\s*(\d+)\s*-\s*(\d+)\s*$/i;
const researchReg = /^\s*r(?:esearch)?\s*([a-f])\s*$/i
const targetReg = /^\s*t(?:arget)?\s*(\d+)\s*$/i;
function resolveText(textEntry: string, gameSize: number): {movement: number; entry: string} {
    if (textEntry.trim() === "") {
        return {
            entry: textEntry,
            movement: 0,
        };
    }
    let regMatch: RegExpExecArray | null = null;
    if ((regMatch = researchReg.exec(textEntry)) != null) {
        return {
            entry: `Research ${regMatch[1].toUpperCase()}`,
            movement: 1,
        };
    }
    if ((regMatch = targetReg.exec(textEntry)) != null) {
        return {
            entry: `Target ${regMatch[1]}`,
            movement: 4,
        }
    }
    if ((regMatch = surveyReg.exec(textEntry)) != null) {
        let movement: number;
        let length = Number(regMatch[3]) - Number(regMatch[2]) + 1;
        if (length < 0) length += gameSize;
        if (length > 6) movement = 2;
        else if (length > 3) movement = 3;
        else movement = 4;
        return {
            entry: `${regMatch[1].toUpperCase()} ${regMatch[2]}-${regMatch[3]}`,
            movement,
        };
    }
    return {
        entry: textEntry,
        movement: 0
    };
}

function pushNewTopRow(draftTopRows: TopRowModel[]): void {
    draftTopRows.push({
        id: draftTopRows[draftTopRows.length - 1].id + 1,
        action: "",
        result: "",
        p2: "",
        p3: "",
        p4: "",
    });
}

export function registerTopRowsReducer(builder: ActionReducerMapBuilder<ReduxGameState>): void {
    builder.addCase(playerTextEnterAction, (state, action) => {
        const {player, text, rowId} = action.payload;
        const rowIndex = state.topRows.findIndex((row) => row.id === rowId);
        let prevEntry = resolveText(state.topRows[rowIndex][player], state.gameSize);
        let newEntry = resolveText(text, state.gameSize);
        state.topRows[rowIndex][player] = newEntry.entry;
        adjustPlayerPositionReducer(state, adjustPlayerPosition([playerNameToId[player], newEntry.movement - prevEntry.movement]));
        if (state.topRows.findIndex((row) => row.p2.trim() === "" && row.p3.trim() === "" && row.p4.trim() === "") === -1) {
            pushNewTopRow(state.topRows);
        }
    });
    builder.addCase(setAction, (state, action) => {
        let targetIndex = state.topRows.findIndex((row) => row.action === "");
        if (targetIndex === -1) {
            targetIndex = state.topRows.length;
            pushNewTopRow(state.topRows);
        }
        state.topRows[targetIndex].action = action.payload.action;
        state.topRows[targetIndex].result = action.payload.result;
        adjustPlayerPositionReducer(state, adjustPlayerPosition([0, action.payload.sectors]));
    });
}