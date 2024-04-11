import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {ObjectType} from "../Game";
import {Theory} from "./ReduxGameState";

type WorkingTheory<Nullable = null> = {
    sector: number | Nullable;
    type: ObjectType | Nullable;
};

export type WorkingTheoriesState = Array<Array<WorkingTheory>>;

function ensureTheory(state: WorkingTheoriesState, playerId: number, theoryIdx: number) {
    while (state.length <= playerId) {
        state.push([]);
    }
    while (state[playerId].length <= theoryIdx) {
        state[playerId].push({
            sector: null,
            type: null
        });
    }
}

function theoryIsValid(workingTheory: WorkingTheory): workingTheory is WorkingTheory<never> {
    return workingTheory.sector !== null && workingTheory.type !== null;
}

export const workingTheories = createSlice({
    name: "workingTheories",
    initialState: [] as WorkingTheoriesState,
    reducers: {
        setWorkingTheorySector(state, action: PayloadAction<{playerId: number; sector: number | null; theoryIdx: number}>) {
            const {playerId, sector, theoryIdx} = action.payload;
            ensureTheory(state, playerId, theoryIdx);
            if (sector == null) {
                state[playerId] = state[playerId].slice(0, theoryIdx);
            } else {
                state[playerId][theoryIdx].sector = sector;
            }
        },
        setWorkingTheoryObjectType(state, action: PayloadAction<{playerId: number; objectType: ObjectType | null; theoryIdx: number}>) {
            const {playerId, objectType, theoryIdx} = action.payload;
            ensureTheory(state, playerId, theoryIdx);
            state[playerId][theoryIdx].type = objectType;
        },
    },
    selectors: {
        toAddTheoriesInput(state) {
            return state.map((playerTheories) => {
                return playerTheories
                    .filter(theoryIsValid)
                    .map((theory): Theory => ({
                        sector: theory.sector,
                        type: theory.type,
                        verified: false,
                    }))
            });
        }
    }
});
export const {setWorkingTheorySector, setWorkingTheoryObjectType} = workingTheories.actions;