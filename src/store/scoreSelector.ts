import {createSelector} from "@reduxjs/toolkit";
import {ReduxGameState, CompatTheoryObj} from "./ReduxGameState";
import {ObjectType} from "../Game";
import {theoryKeys} from "../atoms";
import {legacyTheoriesSelector} from "./theories";

interface Score {
    gameOverReady: boolean;
    firstPlace: number;
    asteroids: number;
    comets: number;
    gasClouds: number;
    dwarfPlanets: number;
    planetX: boolean;
    subtotal: number;
}

export const scoreSelector = createSelector([
    legacyTheoriesSelector,
    (state: ReduxGameState) => state.topRows,
    (state: ReduxGameState) => state.game.game,
    (state: ReduxGameState) => state.gameSize,
], (theories, topRows, game, gameSize): Score | null => {
    if (game == null) return null;
    const outputScore: Score = {
        gameOverReady: theories.every((theoryRow) => (Object.values(theoryRow) as CompatTheoryObj[keyof CompatTheoryObj][]).every((theorySet) => theorySet.every((theory) => theory[2]))),
        firstPlace: 0,
        asteroids: 0,
        comets: 0,
        gasClouds: 0,
        dwarfPlanets: 0,
        planetX: false,
        subtotal: 0
    };
    theories.forEach((theoryRow, rowNumber) => {
        theoryRow.self.forEach((theory) => {
            if (!theory[2]) return;
            if (game.obj[theory[0]] === theory[1]) {
                // Theory correct
                if (theories.findIndex((theoryRow) => theoryKeys.some((key) => theoryRow[key].some((other) => theory[0] === other[0] && theory[1] === other[1]))) >= rowNumber) {
                    // First place (or tied for such)
                    outputScore.firstPlace++;
                }
                switch (theory[1]) {
                    case ObjectType.ASTEROID:
                        outputScore.asteroids += 2;
                        break;
                    case ObjectType.DWARF_PLANET:
                        outputScore.dwarfPlanets += gameSize === 18 ? 2 : 4;
                        break;
                    case ObjectType.COMET:
                        outputScore.comets += 3;
                        break;
                    case ObjectType.GAS_CLOUD:
                        outputScore.gasClouds += 4;
                        break;
                }
            }
        });
    });
    if (topRows.some((row) => row.action === "Locate Planet X" && row.result === "\u2713")) {
        // Player successfully located Planet X
        outputScore.planetX = true;
    }
    outputScore.subtotal = Object.values(outputScore).reduce((sum, value) => sum + (typeof value === 'number' ? value : 0), 0);
    return outputScore;
});