import {Sector} from "../NoteWheel";
import {ActionReducerMapBuilder, createAction, createSelector} from "@reduxjs/toolkit";
import {ObjectTypes} from "../GameTypes";
import {ReduxGameState} from "./ReduxGameState";
import {ObjectType, objectTypeStringToEnum} from "../Game";
import {cacheOutputIfShallowEquals} from "./helpers";

export function createInitialMap(): Sector[] {
    return new Array(18).fill(null).map((_) => ({
        x: [],
        o: []
    }));
}

export const clickAction = createAction<{sector: number; object: ObjectTypes}>("map/clickAction");

export const mapSelector = (state: ReduxGameState) => state.map;
export const guessTheoryFromMapSelector = createSelector(
    [(state: ReduxGameState) => state.map],
    cacheOutputIfShallowEquals((map) => {
        return map.map((sector) => sector.o.length === 0 ? null : sector.o.map(objectTypeStringToEnum).filter((objectType) => objectType !== ObjectType.EMPTY && objectType < ObjectType.PLANET_X)[0]);
    })
);

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