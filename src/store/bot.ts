import {ActionReducerMapBuilder, createAction} from "@reduxjs/toolkit";
import {ReduxGameState} from "./ReduxGameState";
import {playerTextEnterAction, playerTextEnterReducer} from "./topRows";
import {adjustPlayerPosition, adjustPlayerPositionReducer} from "./playerSectorPosition";
import {researchName} from "../Research";
import {sectorCountToTime} from "../actions/Survey";

export const tickBotAction = createAction("bot/tickBot");

export function registerBotReducer(builder: ActionReducerMapBuilder<ReduxGameState>) {
    builder.addCase(tickBotAction, (state, action) => {
        if (state.game.game == null) {
            console.error("Attempted to tick bot while game was null!");
            return;
        }
        if (state.game.game.solo == null) {
            console.error("No solo information for this game!");
            return;
        }
        const nextBotAction = state.game.game.solo.turns[state.nextBotAction];
        if (nextBotAction == null) {
            // End of game
            return;
        }
        console.log(nextBotAction);
        let botAdvance: number;
        let botRow: string;
        switch (nextBotAction.action) {
            case "T":
                botRow = `Target ${nextBotAction.sector}`;
                botAdvance = 4;
                break;
            case "X":
                botRow = "LPX \u2713";
                botAdvance = 5;
                break;
            case "R":
                botRow = `Research ${nextBotAction.conf}`;
                botAdvance = 1;
                break;
            default:
                botRow = `${researchName([nextBotAction.action], true)} ${nextBotAction.x}-${nextBotAction.y}`;
                let {x: start, y: end} = nextBotAction;
                if (end < start) {
                    end += 18;
                }
                botAdvance = sectorCountToTime[(end - start) + 1];
                break;
        }
        state.nextBotAction++;
        playerTextEnterReducer(state, playerTextEnterAction({
            player: "p2",
            text: botRow,
            rowId: -1,
        }));
        adjustPlayerPositionReducer(state, adjustPlayerPosition([1, botAdvance]));
    });
}