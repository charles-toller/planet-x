import {ActionReducerMapBuilder, createAction, createSelector} from "@reduxjs/toolkit";
import {TheoryObj} from "../atoms";
import {CompatTheoryObj, ReduxGameState, Theory} from "./ReduxGameState";
import {ObjectType} from "../Game";
import {adjustPlayerPosition, adjustPlayerPositionReducer} from "./playerSectorPosition";
import {WritableDraft} from "immer/dist/types/types-external";

function newTheoryToOld(theory: Theory): CompatTheoryObj['self'][number] {
    return [theory.sector, theory.type, theory.verified];
}
function oldTheoryToNew(theory: CompatTheoryObj['self'][number]): Theory {
    return {
        sector: theory[0],
        type: theory[1],
        verified: theory[2]
    };
}

export const theoriesSelector = createSelector([(state: ReduxGameState) => state.theories], (theories): CompatTheoryObj[] => {
    return theories.map((row) => ({
        self: row[0].map(newTheoryToOld),
        p2: row[1].map(newTheoryToOld),
        p3: row[2].map(newTheoryToOld),
        p4: row[3].map(newTheoryToOld),
    }));
});
export const addTheoriesAction = createAction<TheoryObj>('theories/add');
export const verifyTheoryAction = createAction<{rowIndex: number; tIndex: number; player: 'self' | 'p2' | 'p3' | 'p4'}>('theories/verify');
export const verifyAllTheoriesAction = createAction('theories/verifyAll');
export const setTheoryTypeAction = createAction<{rowIndex: number; tIndex: number; player: 'self' | 'p2' | 'p3' | 'p4'; type: ObjectType}>('theories/setType')

const playerNames: Array<'self' | 'p2' | 'p3' | 'p4'> = ["self", "p2", "p3", "p4"];
export const playerNameToId: {[key in 'self' | 'p2' | 'p3' | 'p4']: number} = {
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
        for (let playerIndex = 0; playerIndex < row.length; playerIndex++) {
            for (const theory of row[playerIndex]) {
                if (theory.verified && theory.type === game!.obj[theory.sector]) {
                    correctSectors.add(theory.sector);
                    continue;
                }
                if (theory.verified) continue;
                if (rowNumber <= checkIdx || correctSectors.has(theory.sector)) {
                    if (theory.type === ObjectType.BOT) {
                        theory.type = game!.obj[theory.sector];
                    }
                    theory.verified = true;
                    if (theory.type !== ObjectType.PLAYER && theory.type !== game!.obj[theory.sector]) {
                        // Incorrect theory
                        adjustPlayerPositionReducer(state, adjustPlayerPosition([playerIndex, 1]));
                    } else if (theory.type !== ObjectType.PLAYER) {
                        correctSectors.add(theory.sector);
                    }
                }
            }
        }
    }
}


function verifyAllTheories(theoriesDraft: WritableDraft<Theory[][][]>, state: ReduxGameState) {
    theoriesDraft.forEach((row) => {
        row.forEach((playerRow, playerIndex) => {
            playerRow.forEach((theory) => {
                if (!theory.verified) {
                    theory.verified = true;
                    if (theory.type !== state.game.game!.obj[theory.sector] && theory.type !== ObjectType.BOT && theory.type !== ObjectType.PLAYER) {
                        // Theory incorrect
                        adjustPlayerPositionReducer(state, adjustPlayerPosition([playerIndex, 1]));
                    }
                }
            });
        });
    });
}

export function registerTheoriesReducer(builder: ActionReducerMapBuilder<ReduxGameState>): void {
    builder.addCase(addTheoriesAction, (state, action) => {
        state.theories.push(playerNames.map((playerName) => action.payload[playerName].map(oldTheoryToNew)));
        reduxForwardVerifyTheories(state);
    });
    builder.addCase(verifyAllTheoriesAction, (state) => {
        verifyAllTheories(state.theories, state);
    });
    builder.addCase(setTheoryTypeAction, (state, action) => {
        const {rowIndex, tIndex, player, type} = action.payload;
        const target = state.theories[rowIndex][playerNameToId[player]][tIndex];
        if (target.verified) {
            const correct = state.game.game!.obj[target.sector];
            if (target.type === correct && type !== correct) {
                // Now invalid
                adjustPlayerPositionReducer(state, adjustPlayerPosition([playerNameToId[player], 1]));
            } else if (target.type !== correct && type === correct) {
                // Now valid
                adjustPlayerPositionReducer(state, adjustPlayerPosition([playerNameToId[player], -1]));
            }
        }
        target.type = type;
        reduxForwardVerifyTheories(state);
    });
    builder.addCase(verifyTheoryAction, (state, action) => {
        const {rowIndex, tIndex, player} = action.payload;
        const target = state.theories[rowIndex][playerNameToId[player]][tIndex];
        target.verified = true;
        if ([ObjectType.PLAYER, ObjectType.BOT].includes(target.type) && target.type !== state.game.game!.obj[target.sector]) {
            adjustPlayerPositionReducer(state, adjustPlayerPosition([playerNameToId[player], 1]));
        }
        reduxForwardVerifyTheories(state);
    });
}