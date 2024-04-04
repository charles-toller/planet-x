import {ActionReducerMapBuilder, createAction, createSelector} from "@reduxjs/toolkit";
import {TheoryObj, verifyAllTheories} from "../atoms";
import {ReduxGameState} from "./ReduxGameState";
import {ObjectType} from "../Game";
import {adjustPlayerPosition, adjustPlayerPositionReducer} from "./playerSectorPosition";

export const theoriesSelector = createSelector([(state: ReduxGameState) => state.theories], (theories) => theories);
export const addTheoriesAction = createAction<TheoryObj>('theories/add');
export const verifyTheoryAction = createAction<{rowIndex: number; tIndex: number; player: 'self' | 'p2' | 'p3' | 'p4'}>('theories/verify');
export const verifyAllTheoriesAction = createAction('theories/verifyAll');
export const setTheoryTypeAction = createAction<{rowIndex: number; tIndex: number; player: 'self' | 'p2' | 'p3' | 'p4'; type: ObjectType}>('theories/setType')

const playerNames: Array<'self' | 'p2' | 'p3' | 'p4'> = ["self", "p2", "p3", "p4"];
const playerNameToId: {[key in 'self' | 'p2' | 'p3' | 'p4']: number} = {
    self: 0,
    p2: 1,
    p3: 2,
    p4: 3
};

function reduxForwardVerifyTheories(state: ReduxGameState) {
    const game = state.game.game;
    const theories = state.theories;
    const checkIdx = theories.length - 3;
    const correctSectors: Set<number> = new Set();
    for (let rowNumber = 0; rowNumber < theories.length; rowNumber++) {
        const row = theories[rowNumber];
        for (const playerName of playerNames) {
            for (const theory of row[playerName]) {
                if (theory[2] && theory[1] === game!.obj[theory[0]]) {
                    correctSectors.add(theory[0]);
                    continue;
                }
                if (theory[2]) continue;
                if (rowNumber <= checkIdx || correctSectors.has(theory[0])) {
                    if (theory[1] === ObjectType.BOT) {
                        theory[1] = game!.obj[theory[0]];
                    }
                    theory[2] = true;
                    if (theory[1] !== ObjectType.PLAYER && theory[1] !== game!.obj[theory[0]]) {
                        // Incorrect theory
                        adjustPlayerPositionReducer(state, adjustPlayerPosition([playerNameToId[playerName], 1]));
                    } else if (theory[1] !== ObjectType.PLAYER) {
                        correctSectors.add(theory[0]);
                    }
                }
            }
        }
    }
}


export function registerTheoriesReducer(builder: ActionReducerMapBuilder<ReduxGameState>): void {
    builder.addCase(addTheoriesAction, (state, action) => {
        state.theories.push(action.payload);
        reduxForwardVerifyTheories(state);
    });
    builder.addCase(verifyAllTheoriesAction, (state) => {
        // TODO: Make affect position
        verifyAllTheories(state.theories);
    });
    builder.addCase(setTheoryTypeAction, (state, action) => {
        const {rowIndex, tIndex, player, type} = action.payload;
        const target = state.theories[rowIndex][player][tIndex];
        if (target[2]) {
            const correct = state.game.game!.obj[target[0]];
            if (target[1] === correct && type !== correct) {
                // Now invalid
                adjustPlayerPositionReducer(state, adjustPlayerPosition([playerNameToId[player], 1]));
            } else if (target[1] !== correct && type === correct) {
                // Now valid
                adjustPlayerPositionReducer(state, adjustPlayerPosition([playerNameToId[player], -1]));
            }
        }
        target[1] = type;
        reduxForwardVerifyTheories(state);
    });
    builder.addCase(verifyTheoryAction, (state, action) => {
        const {rowIndex, tIndex, player} = action.payload;
        const target = state.theories[rowIndex][player][tIndex];
        target[2] = true;
        if ([ObjectType.PLAYER, ObjectType.BOT].includes(target[1]) && target[1] !== state.game.game!.obj[target[0]]) {
            adjustPlayerPositionReducer(state, adjustPlayerPosition([playerNameToId[player], 1]));
        }
        reduxForwardVerifyTheories(state);
    });
}