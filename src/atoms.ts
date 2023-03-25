import {atom, AtomEffect, selector} from "recoil";

const resetSet = new Set<() => unknown>();

export function resetPersistentAtoms() {
    for (const fn of resetSet) {
        fn();
    }
}

function persistentAtomEffect<T>(storageKey: string, defaultValue: T): AtomEffect<T> {
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
})

export const gameIdState = atom({
    key: 'gameId',
    effects: [
        persistentAtomEffect<string | null>('gameId', null)
    ]
});