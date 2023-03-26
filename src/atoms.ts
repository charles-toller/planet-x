import {atom, AtomEffect, selector} from "recoil";
import {Sector} from "./NoteWheel";
import {inflate} from "pako";
import * as tar from "tar-stream";
import {Game, ObjectType} from "./Game";

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
        e.on('entry', (header, stream, next) => {
            if (header.name === `maps/${gameId}.json`) {
                let data = '';
                const decoder = new TextDecoder();
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
                e.write(inflate(buffer));
            } catch (err) {
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
    self: [number, ObjectType][];
    p2: [number, ObjectType][];
    p3: [number, ObjectType][];
    p4: [number, ObjectType][];
    isChecked: boolean;
}

export const theoriesState = atom({
    key: 'theories',
    effects: [
        persistentAtomEffect('theories', [] as TheoryObj[])
    ]
});