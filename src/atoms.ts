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

const _theoriesState = atom({
    key: 'theories',
    effects: [
        persistentAtomEffect('theories', [] as TheoryObj[])
    ]
});

export const theoriesState = selector({
    key: 'theoriesSelector',
    get: ({get}) => {
        return get(_theoriesState);
    },
    set: ({get, set}, newValue) => {
        const game = get(gameState);
        if (newValue instanceof DefaultValue || game == null) {
            set(_theoriesState, newValue);
            return;
        }
        const oldValue = get(_theoriesState);
        const newIncorrectCount: {[key in (typeof theoryKeys)[number]]: number} = {
            self: 0,
            p2: 0,
            p3: 0,
            p4: 0,
        };
        oldValue.forEach((row, rowNumber) => theoryKeys.forEach((key) => row[key].forEach((theory, theoryNumber) => {
            const n = newValue[rowNumber][key][theoryNumber];
            if (n[2] && n[1] !== theory[1]) {
                // Theory type changed
                if (theory[1] === ObjectType.PLAYER && n[1] !== game.obj[theory[0]]) {
                    // Used to be player theory, now incorrect
                    newIncorrectCount[key]++;
                } else if (theory[1] !== ObjectType.PLAYER) {
                    if (n[1] === game.obj[theory[0]]) {
                        // Used to be incorrect, now correct (misclick)
                        newIncorrectCount[key]--;
                    } else {
                        // Used to be correct, now incorrect
                        newIncorrectCount[key]++;
                    }
                }
            } else if (n[2] && !theory[2]) {
                // This theory is now verified
                if (n[1] === ObjectType.BOT || n[1] === ObjectType.PLAYER) {
                    return;
                }
                if (n[1] !== game.obj[theory[0]]) {
                    newIncorrectCount[key]++;
                }
            }
        })));
        set(sectorState, (oldSectorNumber) => {
            return oldSectorNumber + newIncorrectCount.self;
        });
        set(playerPositionState, (oldPlayerPositions) => {
            return [oldPlayerPositions[0] + newIncorrectCount.p2, oldPlayerPositions[1] + newIncorrectCount.p3, oldPlayerPositions[2] + newIncorrectCount.p4] as [number, number, number];
        });
        set(_theoriesState, newValue);
    }
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

export function forwardVerifyTheories(game: Game, draft: WritableDraft<TheoryObj[]>) {
    const checkIdx = draft.length - 3;
    const correctSectors = draft.flatMap((row, rowNumber) =>
        Object.values(row).flatMap((section) =>
            section
                .filter((theory) => (theory[2] || rowNumber <= checkIdx) && (theory[1] === ObjectType.BOT || theory[1] === game.obj[theory[0]]))
                .map((theory) => theory[0])
        )
    )
    draft.forEach((row, rowNumber) => {
        Object.values(row).forEach((section) => {
            section.forEach((theory) => {
                if (theory[2]) return;
                if (rowNumber <= checkIdx || correctSectors.includes(theory[0])) {
                    theory[2] = true;
                    if (theory[1] === ObjectType.BOT) {
                        theory[1] = game.obj[theory[0]];
                    }
                }
            });
        });
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