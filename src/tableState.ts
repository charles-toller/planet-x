import {atom, DefaultValue, noWait, selector} from "recoil";
import {gameState, playerPositionState} from "./atoms";
import {researchName} from "./Research";
import {sectorCountToTime} from "./actions/Survey";
import produce from "immer";
import {ConferenceKey} from "./Game";
import {persistentAtomEffect} from "./persistentAtomEffect";
import {store} from "./store/store";

export interface TopRowModel {
    id: number;
    action: string;
    p2: string;
    p3: string;
    p4: string;
    result: string;
}

export interface BottomRowModel {
    id: number;
    notes: string;
    otherNotes: string;
    researchId: ConferenceKey;
    researchType: string;
}
export const topRowsState = atom<TopRowModel[]>({
    key: 'topRows',
    effects: [
        ({setSelf, onSet}) => {
            setSelf(store.getState().topRows);
            onSet(() => {
                throw new Error("readonly");
            });
            return store.subscribe(() => {
                setSelf(store.getState().topRows);
            });
        }
    ],
});

export const bottomRowsState = atom<BottomRowModel[]>({
    key: 'topRows',
    effects: [
        ({setSelf, onSet}) => {
            setSelf(store.getState().bottomRows);
            onSet(() => {
                throw new Error("readonly");
            });
            return store.subscribe(() => {
                setSelf(store.getState().bottomRows);
            });
        }
    ],
});

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

const defaultBotState = {
    nextAction: 0,
};
const _botState = atom({
    key: '_botState',
    effects: [
        persistentAtomEffect('_botState', defaultBotState),
    ]
});
export const botState = selector({
    key: 'botState',
    get: ({get}) => get(_botState),
    set: ({get, set}, newValue) => {
        if (newValue instanceof DefaultValue) {
            set(_botState, newValue);
            return;
        }
        const oldValue = get(_botState);
        const toSet = {
            ...oldValue,
        }
        if (oldValue.nextAction !== newValue.nextAction) {
            const gameStateVal = get(gameState);
            if (gameStateVal == null) {
                console.error("Attempted to tick bot while game was null!");
                return;
            }
            if (gameStateVal.solo == null) {
                console.error("Attempted to tick bot with no solo info!");
                return;
            }
            toSet.nextAction++;
            let botRow = "";
            let botAdvance = 0;
            const botAction = gameStateVal.solo.turns[oldValue.nextAction];
            console.log(botAction);
            switch (botAction.action) {
                case "T":
                    botRow = `Target ${botAction.sector}`;
                    botAdvance = 4;
                    break;
                case "X":
                    botRow = "LPX \u2713";
                    botAdvance = 5;
                    break;
                case "R":
                    botRow = `Research ${botAction.conf}`;
                    botAdvance = 1;
                    break;
                default:
                    botRow = `${researchName([botAction.action], true)} ${botAction.x}-${botAction.y}`;
                    let {x: start, y: end} = botAction;
                    if (end < start) {
                        end += 18;
                    }
                    botAdvance = sectorCountToTime[(end - start) + 1];
                    break;
            }
            set(topRowsState, produce((rows: TopRowModel[]) => {
                const rowIndex = rows.findIndex((row) => row.p2 === "");
                rows[rowIndex].p2 = botRow;
                if (rowIndex === rows.length - 1) {
                    pushNewTopRow(rows);
                }
            }));
            set(playerPositionState, ([p2, p3, p4]) => [p2 + botAdvance, p3, p4] as [number, number, number]);
        }
        set(_botState, toSet);
    }
})
export const surveyReg = /^\s*([egdac])\s*(\d+)\s*-\s*(\d+)\s*$/i;