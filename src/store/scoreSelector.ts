import {createSelector} from "@reduxjs/toolkit";
import {ReduxGameState} from "./ReduxGameState";
import {ObjectType} from "../Game";
import {theoriesSelector} from "./theories";

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
    theoriesSelector,
    (state: ReduxGameState) => state.topRows,
    (state: ReduxGameState) => state.game.game,
    (state: ReduxGameState) => state.gameSize,
], ({theories}, topRows, game, gameSize): Score | null => {
    if (game == null) return null;
    const outputScore: Score = {
        gameOverReady: theories.every((theoryRow) => theoryRow.every((playerRow) => playerRow.every((theory) => theory.verified))),
        firstPlace: 0,
        asteroids: 0,
        comets: 0,
        gasClouds: 0,
        dwarfPlanets: 0,
        planetX: false,
        subtotal: 0
    };
    theories.forEach((theoryRow, rowNumber) => {
        theoryRow[0].forEach((theory) => {
            if (!theory.verified) return;
            if (game.obj[theory.sector] === theory.type) {
                // Theory correct
                if (rowNumber === theories.findIndex((theoryRow) => theoryRow.some((playerRow) => playerRow.some((oTheory) => oTheory.sector === theory.sector && oTheory.type === game.obj[theory.sector])))) {
                    // First place (or tied for such)
                    outputScore.firstPlace++;
                }
                switch (theory.type) {
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