import {ActionReducerMapBuilder, createAction} from "@reduxjs/toolkit";
import {ReduxGameState} from "./ReduxGameState";
import {ConferenceKey} from "../Game";
import {researchLookup, researchName} from "../Research";

import {setReduxGameId} from "./setReduxGameId";
import {BottomRowModel} from "../tableState";

export const bottomInitialRows: () => BottomRowModel[] = () => [
    {id: 1, notes: "", otherNotes: "", researchId: "A", researchType: ""},
    {id: 2, notes: "", otherNotes: "", researchId: "B", researchType: ""},
    {id: 3, notes: "", otherNotes: "", researchId: "C", researchType: ""},
    {id: 4, notes: "", otherNotes: "", researchId: "D", researchType: ""},
    {id: 5, notes: "", otherNotes: "", researchId: "E", researchType: ""},
    {id: 6, notes: "", otherNotes: "", researchId: "F", researchType: ""},
    {id: 7, notes: "", otherNotes: "", researchId: "X1", researchType: ""},
    {id: 8, notes: "", otherNotes: "", researchId: "X2", researchType: ""},
];

export const researchRevealAction = createAction<{research: ConferenceKey}>("bottomRows/revealResearch");
export const setNotesAction = createAction<{rowId: number; text: string}>("bottomRows/setNotes");

export const bottomRowsSelector = (state: ReduxGameState) => state.bottomRows;

export function registerBottomRowsReducer(builder: ActionReducerMapBuilder<ReduxGameState>): void {
    builder.addMatcher(setReduxGameId.fulfilled.match, (state, action) => {
        state.bottomRows.forEach((row) => {
            row.researchType = researchName(action.payload.game.conf[row.researchId].title, true);
        });
    });
    builder.addCase(researchRevealAction, (state, action) => {
        const targetRow = state.bottomRows.find((row) => row.researchId === action.payload.research);
        if (!targetRow) {
            return;
        }
        const info = state.game?.game?.conf[action.payload.research];
        if (!info) {
            return;
        }
        targetRow.notes = researchLookup[info.body.type](info.body as any) + ".";
    });
    builder.addCase(setNotesAction, (state, action) => {
        const targetRow = state.bottomRows.find((row) => row.id === action.payload.rowId);
        if (targetRow == null) return;
        targetRow.otherNotes = action.payload.text;
    });
}