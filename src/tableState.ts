import {atom, DefaultValue, noWait, selector} from "recoil";
import {gameState, playerPositionState, sectorClamp, sectorState} from "./atoms";
import {GridRowModel, GridRowsProp} from "@mui/x-data-grid";
import {researchName} from "./Research";
import {sectorCountToTime} from "./actions/Survey";
import produce from "immer";
import {ConferenceKey} from "./Game";
import {persistentAtomEffect} from "./persistentAtomEffect";
import {store} from "./store/store";
import {setAction as reduxSetAction} from "./store/topRows";

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
    researchId: string;
    researchType: string;
}

const topInitialRows: GridRowsProp<TopRowModel> = [
    {action: "", p2: "", p3: "", p4: "", id: 1, result: ""},
];
const bottomInitialRows: GridRowsProp<BottomRowModel> = [
    {id: 1, notes: "", otherNotes: "", researchId: "A", researchType: ""},
    {id: 2, notes: "", otherNotes: "", researchId: "B", researchType: ""},
    {id: 3, notes: "", otherNotes: "", researchId: "C", researchType: ""},
    {id: 4, notes: "", otherNotes: "", researchId: "D", researchType: ""},
    {id: 5, notes: "", otherNotes: "", researchId: "E", researchType: ""},
    {id: 6, notes: "", otherNotes: "", researchId: "F", researchType: ""},
    {id: 7, notes: "", otherNotes: "", researchId: "X1", researchType: ""},
    {id: 8, notes: "", otherNotes: "", researchId: "X2", researchType: ""},
];
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
const baseBottomRowsState = atom({
    key: 'baseBottomRows',
    effects: [
        persistentAtomEffect('baseBottomRows', bottomInitialRows),
    ],
});
/*
setBottomRows((bottomRows) => bottomRows.map((row) => ({
            ...row,
            researchType: researchName(game?.conf[row.researchId as ConferenceKey].title!, true)
        })))
* */
export const bottomRowsState = selector({
    key: 'bottomRows',
    get: ({get}) => {
        const game = get(noWait(gameState)).valueMaybe();
        return get(baseBottomRowsState).map((row) => ({
            ...row,
            researchType: researchName(game?.conf[row.researchId as ConferenceKey].title ?? [], true),
        }));
    },
    set: ({set}, newValue) => {
        set(baseBottomRowsState, newValue);
    }
})

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

export const tableActions = selector({
    key: 'tableActions',
    get: ({getCallback}) => {
        const setAction = async (action: string, result: string, sectors: number) => {
            store.dispatch(reduxSetAction({action, result, sectors}));
        };
        const setResearch = getCallback(({set}) => async (researchKey: ConferenceKey, research: string) => {
            set(bottomRowsState, (bottomRows) => bottomRows.map((row) => row.researchId === researchKey ? {
                ...row,
                notes: research
            } : row))
        });
        return {
            setAction,
            setResearch,
        };
    },
});
type SectorMovement = { p2?: number; p3?: number; p4?: number };

export function getNewActions(oldRow: GridRowModel<TopRowModel>, newRow: Pick<GridRowModel<TopRowModel>, 'p2' | 'p3' | 'p4'>): SectorMovement {
    const ret: SectorMovement = {};
    for (const key of (["p2", "p3", "p4"] as const)) {
        let regResult;
        if (oldRow[key] === "" && newRow[key] !== "") {
            if (newRow[key].startsWith("Research")) {
                ret[key] = 1;
            } else if (newRow[key].startsWith("Target")) {
                ret[key] = 4;
            } else if ((regResult = surveyReg.exec(newRow[key])) != null) {
                let numSectors = Number(regResult[3]) - Number(regResult[2]) + 1;
                while (numSectors < 1) numSectors += 18;
                if (numSectors > 6) {
                    ret[key] = 2;
                } else if (numSectors > 3) {
                    ret[key] = 3;
                } else {
                    ret[key] = 4;
                }
            }
        }
    }
    return ret;
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