import {atom, DefaultValue, selector} from "recoil";
import {Sector} from "./NoteWheel";
import {inflate} from "pako";
import * as tar from "tar-stream";
import {Game, ObjectType} from "./Game";
import {WritableDraft} from "immer/dist/types/types-external";

import {topRowsState} from "./tableState";
import {persistentAtomEffect} from "./persistentAtomEffect";
import {store} from "./store/store";
import {
    recoilPlayerPositionStateSelector,
    recoilSectorStateSelector,
    updatePlayerPosition
} from "./store/playerSectorPosition";
import {theoriesSelector} from "./store/theories";

const extract = tar.extract;

export function sectorClamp(sector: number, size = 18): number {
    let newSector = sector % size;
    while (newSector <= 0) newSector += size;
    return newSector;
}

export const sectorState = atom<number>({
    key: 'sector',
    default: 1,
    effects: [
        ({setSelf, onSet}) => {
            setSelf(recoilSectorStateSelector(store.getState()));
            onSet((newValue) => {
                store.dispatch(updatePlayerPosition([0, newValue]));
            });
            return store.subscribe(() => {
                setSelf(recoilSectorStateSelector(store.getState()));
            });
        }
    ]
});

const baseSectors: Sector[] = new Array(18).fill(null).map((_) => ({
    x: [],
    o: []
}));

export const sectorsState = atom({
    key: 'sectors',
    effects: [
        persistentAtomEffect('sectors', baseSectors)
    ]
});

export const playerPositionState = atom<[number, number, number]>({
    key: 'playerPosition',
    default: [1, 1, 1],
    effects: [
        ({setSelf, onSet}) => {
            setSelf(recoilPlayerPositionStateSelector(store.getState()));
            onSet((newValue, oldValue) => {
                newValue.forEach((playerPosition, i) => {
                    const playerID = i + 1;
                    if (oldValue instanceof DefaultValue || playerPosition !== oldValue[i]) {
                        store.dispatch(updatePlayerPosition([playerID, playerPosition]));
                    }
                });
            });
            return store.subscribe(() => {
                setSelf(recoilPlayerPositionStateSelector(store.getState()));
            });
        }
    ]
});

export function fetchGame(gameId: string): Promise<Game> {
    return new Promise((resolve) => {
        const e = extract();
        // @ts-ignore
        e.on('entry', (header, stream, next) => {
            if (header.name === `maps/${gameId}.json`) {
                let data = '';
                const decoder = new TextDecoder();
                // @ts-ignore
                stream.on('data', (d) => {
                    data += decoder.decode(d);
                });
                stream.on('end', () => {
                    const nGame = JSON.parse(data);
                    resolve(nGame);
                    next();
                });
            } else {
                stream.resume();
                stream.on('end', () => next());
            }
        });
        fetch(new URL('/maps.tar.gz', import.meta.url)).then((body) => body.arrayBuffer()).then((buffer) => {
            try {
                // @ts-ignore
                e.write(inflate(buffer));
            } catch (err) {
                // @ts-ignore
                e.write(new Uint8Array(buffer));
            }
        });
    });
}

export const gameState = atom<Game | null>({
    key: 'game',
    default: null,
    effects: [
        ({setSelf}) => {
            setSelf(store.getState().game.game);
            return store.subscribe(() => {
                setSelf(store.getState().game.game);
            });
        }
    ]
});

export interface TheoryObj {
    self: [sector: number, type: ObjectType, verified: boolean][];
    p2: [sector: number, type: ObjectType, verified: boolean][];
    p3: [sector: number, type: ObjectType, verified: boolean][];
    p4: [sector: number, type: ObjectType, verified: boolean][];
}

export const theoryKeys = ["self", "p2", "p3", "p4"] as const;

export const theoriesState = atom<TheoryObj[]>({
    key: 'theoriesState',
    default: [],
    effects: [
        ({setSelf, onSet}) => {
            setSelf(theoriesSelector(store.getState()));
            onSet(() => {
                throw new Error("readonly");
            });
            return store.subscribe(() => {
                setSelf(theoriesSelector(store.getState()));
            });
        }
    ]
});

export function verifyAllTheories(draft: WritableDraft<TheoryObj[]>) {
    draft.forEach((row) => {
        for (const key of theoryKeys) {
            row[key].forEach((theory) => {
                theory[2] = true;
            });
        }
    });
}

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

export const scoreState = selector({
    key: 'score',
    get: ({get}) => {
        const theories = get(theoriesState);
        const topRow = get(topRowsState);
        const game = get(gameState);
        if (game == null) return null;
        const outputScore: Score = {
            gameOverReady: true,
            firstPlace: 0,
            asteroids: 0,
            comets: 0,
            gasClouds: 0,
            dwarfPlanets: 0,
            planetX: false,
            subtotal: 0
        };
        outputScore.gameOverReady = theories.every((theoryRow) => theoryKeys.every((key) => theoryRow[key].every((theory) => theory[2])));
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
                            outputScore.dwarfPlanets += 2;
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
        if (topRow.some((row) => row.action === "Locate Planet X" && row.result === "\u2713")) {
            // Player successfully located Planet X
            outputScore.planetX = true;
        }
        outputScore.subtotal = Object.values(outputScore).reduce((sum, value) => sum + (typeof value === 'number' ? value : 0), 0);
        return outputScore;
    },
});