import {createAction, StoreEnhancer} from "@reduxjs/toolkit";

export const resetAction = createAction("localStorageEnhancer/reset");

export function localStorageEnhancer<T>(localStorageKey: string): StoreEnhancer {
    return (createStore) => (reducer) => {
        const storedReducer = (state: any, action: any) => {
            let newState;
            if (resetAction.match(action)) {
                newState = reducer(undefined, action as never);
            }
            else {
                newState = reducer(state, action);
            }
            localStorage.setItem(localStorageKey, JSON.stringify(newState));
            return newState;
        }
        const initialState = JSON.parse(localStorage.getItem(localStorageKey) ?? "null");
        return createStore(storedReducer, initialState ?? undefined);
    }
}