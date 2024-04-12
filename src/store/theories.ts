import {ActionReducerMapBuilder, createAction, createSelector, weakMapMemoize} from "@reduxjs/toolkit";
import {CompatTheoryObj, ReduxGameState, Theory} from "./ReduxGameState";
import {ObjectType} from "../Game";
import {adjustPlayerPosition, adjustPlayerPositionReducer} from "./playerSectorPosition";
import {WritableDraft} from "immer/dist/types/types-external";
import {cometSectors} from "../GameTypes";
import {workingTheories} from "./workingTheories";
import {CombineMatchers} from "./helpers";

function newTheoryToOld(theory: Theory): CompatTheoryObj['self'][number] {
    return [theory.sector, theory.type, theory.verified];
}

export const legacyTheoriesSelector = createSelector([(state: ReduxGameState) => state.theories], (theories): CompatTheoryObj[] => {
    return theories.map((row) => ({
        self: row[0]?.map(newTheoryToOld) ?? [],
        p2: row[1]?.map(newTheoryToOld) ?? [],
        p3: row[2]?.map(newTheoryToOld) ?? [],
        p4: row[3]?.map(newTheoryToOld) ?? [],
    }));
});
export const theoriesSelector = createSelector(
    [(state: ReduxGameState) => state.theories, (state: ReduxGameState) => state.playerCount],
    (theories, playerCount) => ({
        theories,
        playerCount
    })
);

function _invertAllowedTheories(arr: ObjectType[]): ObjectType[] {
    const allTheories = new Set([ObjectType.ASTEROID, ObjectType.COMET, ObjectType.DWARF_PLANET, ObjectType.GAS_CLOUD]);
    arr.forEach((objType) => allTheories.delete(objType));
    return [...allTheories];
}
export const invertAllowedTheories = weakMapMemoize(_invertAllowedTheories);
/**
 * Returns a list of which objects are permitted for each sector for Player 0
 */
export const allowedSubmissionsSelector = createSelector(
    [(state: ReduxGameState) => state.theories, (state: ReduxGameState) => state.gameSize, (state: ReduxGameState) => state.game],
    (theories, gameSize, game): ObjectType[][] => {
    const returnValue: Array<Set<ObjectType>> = new Array(gameSize).fill(null).map((_, i) => new Set([
        ObjectType.ASTEROID,
        ...(cometSectors.includes(i + 1) ? [ObjectType.COMET] : []),
        ObjectType.DWARF_PLANET,
        ObjectType.GAS_CLOUD
    ]));
    if (game.game == null) {
        return returnValue.map((set) => [...set]);
    }
    let remaining: {[key in ObjectType]: number} = {
        [ObjectType.ASTEROID]: 4,
        [ObjectType.COMET]: 2,
        [ObjectType.DWARF_PLANET]: gameSize === 12 ? 1 : 4,
        [ObjectType.GAS_CLOUD]: 2,
    } as never;
    theories.forEach((theoryRow) => {
        theoryRow[0].forEach((theory) => {
            remaining[theory.type]--;
            // If theory not verified or theory verified correct, don't allow submission
            if (!theory.verified || theory.type === game.game.obj[theory.sector]) {
                returnValue[theory.sector - 1] = new Set();
            }
        });
        theoryRow.slice(1).forEach((playerTheories) => {
            playerTheories.forEach((theory) => {
                if (theory.verified && theory.type === game.game.obj[theory.sector]) {
                    // Other player verified correct, don't allow submission
                    returnValue[theory.sector - 1] = new Set();
                }
            });
        });
    });
    Object.entries(remaining).forEach(([objectType, value]) => {
        if (value === 0) {
            returnValue.forEach((set) => set.delete(Number(objectType) as ObjectType));
        }
    });
    return returnValue.map((set) => [...set]);
});

export const addTheoriesAction = createAction<Theory[][]>('theories/add');
export const addFromWorkingTheoriesAction = createAction('theories/addFromWorking');
export const verifyTheoryAction = createAction<{rowIndex: number; tIndex: number; playerId: number}>('theories/verify');
export const verifyAllTheoriesAction = createAction('theories/verifyAll');
export const setTheoryTypeAction = createAction<{rowIndex: number; tIndex: number; playerId: number; type: ObjectType}>('theories/setType')


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
    const anyAddTheoryAction = new CombineMatchers()
        .addMatcher(addTheoriesAction.match)
        .addMatcher(addFromWorkingTheoriesAction.match);
    builder.addMatcher(anyAddTheoryAction.match, (state, action) => {
        let toAdd: Theory[][];
        if (addFromWorkingTheoriesAction.match(action)) {
            toAdd = workingTheories.selectors.toAddTheoriesInput(state);
            state.workingTheories = workingTheories.getInitialState();
        } else {
            toAdd = action.payload;
        }
        while (toAdd.length < state.playerCount) {
            toAdd.push([]);
        }
        state.theories.push(toAdd);
        reduxForwardVerifyTheories(state);
    });
    builder.addCase(verifyAllTheoriesAction, (state) => {
        verifyAllTheories(state.theories, state);
    });
    builder.addCase(setTheoryTypeAction, (state, action) => {
        const {rowIndex, tIndex, type, playerId} = action.payload;
        const target = state.theories[rowIndex][playerId][tIndex];
        if (target.verified) {
            const correct = state.game.game!.obj[target.sector];
            if (target.type === correct && type !== correct) {
                // Now invalid
                adjustPlayerPositionReducer(state, adjustPlayerPosition([playerId, 1]));
            } else if (target.type !== correct && target.type !== ObjectType.PLAYER && type === correct) {
                // Now valid
                adjustPlayerPositionReducer(state, adjustPlayerPosition([playerId, -1]));
            }
        }
        target.type = type;
        reduxForwardVerifyTheories(state);
    });
    builder.addCase(verifyTheoryAction, (state, action) => {
        const {rowIndex, tIndex, playerId} = action.payload;
        const target = state.theories[rowIndex][playerId][tIndex];
        target.verified = true;
        if ([ObjectType.PLAYER, ObjectType.BOT].includes(target.type) && target.type !== state.game.game!.obj[target.sector]) {
            adjustPlayerPositionReducer(state, adjustPlayerPosition([playerId, 1]));
        }
        reduxForwardVerifyTheories(state);
    });
}