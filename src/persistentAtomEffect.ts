import {AtomEffect} from "recoil";

const resetSet = new Set<() => unknown>();

export function resetPersistentAtoms() {
    for (const fn of resetSet) {
        fn();
    }
}

export function persistentAtomEffect<T>(storageKey: string, defaultValue: T): AtomEffect<T> {
    const globalReset = () => {
        sessionStorage.removeItem(storageKey);
    };
    resetSet.add(globalReset);
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
        resetSet.delete(globalReset);
        return () => {
            resetSet.delete(reset);
            resetSet.add(globalReset);
        };
    }
}