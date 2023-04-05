import {atom, AtomEffect, selector} from "recoil";
import {Sector} from "./NoteWheel";
import {inflate} from "pako";
import * as tar from "tar-stream";
import {Game, ObjectType} from "./Game";
import {WritableDraft} from "immer/dist/types/types-external";

const extract = tar.extract;

const resetSet = new Set<() => unknown>();

export function resetPersistentAtoms() {
    for (const fn of resetSet) {
        fn();
    }
}

export function persistentAtomEffect<T>(storageKey: string, defaultValue: T): AtomEffect<T> {
    return ({setSelf, onSet}) => {
        const storedValue = sessionStorage.getItem(storageKey);
        if (storedValue) {
            setSelf(JSON.parse(storedValue));
        } else {
            setSelf(defaultValue);
        }
        onSet((newValue) => {
            sessionStorage.setItem(storageKey, JSON.stringify(newValue));
        });
        const reset = () => {
            setSelf(defaultValue);
            sessionStorage.removeItem(storageKey);
        };
        resetSet.add(reset);
        return () => {
            resetSet.delete(reset);
        };
    }
}

export function sectorClamp(sector: number): number {
    let newSector = sector % 18;
    if (newSector === 0) newSector = 18;
    return newSector;
}

export const sectorState = atom({
    key: 'sector',
    effects: [
        persistentAtomEffect('sector', 1)
    ]
});

export const availableSectors = selector({
    key: 'availableSectors',
    get: ({get}) => {
        const startSector = get(sectorState);
        return new Array(9).fill(0).map((_, i) => sectorClamp(startSector + i));
    }
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

export const gameIdState = atom({
    key: 'gameId',
    effects: [
        persistentAtomEffect<string | null>('gameId', null)
    ]
});

function fetchGame(gameId: string): Promise<Game> {
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

export const gameState = selector({
    key: 'game',
    get: ({get}) => {
        const gameId = get(gameIdState);
        if (gameId === null) return null;
        return fetchGame(gameId);
    }
});

export interface TheoryObj {
    self: [sector: number, type: ObjectType, verified: boolean][];
    p2: [sector: number, type: ObjectType, verified: boolean][];
    p3: [sector: number, type: ObjectType, verified: boolean][];
    p4: [sector: number, type: ObjectType, verified: boolean][];
}

export const theoryKeys = ["self", "p2", "p3", "p4"] as const;

export const theoriesState = atom({
    key: 'theories',
    effects: [
        persistentAtomEffect('theories', [] as TheoryObj[])
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