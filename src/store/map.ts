import {Sector} from "../NoteWheel";
import {ActionReducerMapBuilder, createAction} from "@reduxjs/toolkit";
import {ObjectTypes} from "../GameTypes";
import {ReduxGameState} from "./ReduxGameState";

export function createInitialMap(): Sector[] {
    return new Array(18).fill(null).map((_) => ({
        x: [],
        o: []
    }));
}

export const clickAction = createAction<{sector: number; object: ObjectTypes}>("map/clickAction");

export const mapSelector = (state: ReduxGameState) => state.map;

export function registerMapReducer(builder: ActionReducerMapBuilder<ReduxGameState>) {
    builder.addCase(clickAction, (state, action) => {
        const mapElement = state.map[action.payload.sector - 1];
        if (mapElement.o.includes(action.payload.object)) {
            mapElement.o.splice(mapElement.o.indexOf(action.payload.object), 1);
        } else if (mapElement.x.includes(action.payload.object)) {
            mapElement.x.splice(mapElement.x.indexOf(action.payload.object), 1);
            mapElement.o.push(action.payload.object);
        } else {
            mapElement.x.push(action.payload.object);
        }
    });
}