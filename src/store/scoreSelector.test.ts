import {expect, test} from "vitest";
import {createAppStore} from "./store";
import {loadTestGameAction} from "../test/helpers";
import {addTheoriesAction} from "./theories";
import {ObjectType} from "../Game";
import {scoreSelector} from "./scoreSelector";
import {setAction} from "./topRows";

test("scoreSelector doesn't allow gameOver if theories are not confirmed", () => {
    const store = createAppStore();
    store.dispatch(loadTestGameAction());
    store.dispatch(addTheoriesAction([[{
        sector: 1,
        type: ObjectType.ASTEROID,
        verified: false,
    }]]));
    expect(scoreSelector(store.getState())?.gameOverReady).toBe(false);
});
test("scoreSelector scores theories correctly", () => {
    const store = createAppStore();
    store.dispatch(loadTestGameAction());
    store.dispatch(addTheoriesAction([[{
        sector: 1,
        type: ObjectType.ASTEROID,
        verified: true,
    }, {
        sector: 2,
        type: ObjectType.COMET,
        verified: true,
    }, {
        sector: 3,
        type: ObjectType.GAS_CLOUD,
        verified: true,
    }, {
        sector: 4,
        type: ObjectType.DWARF_PLANET,
        verified: true,
    }, {
        sector: 5,
        type: ObjectType.DWARF_PLANET,
        verified: true,
    }, {
        sector: 6,
        type: ObjectType.DWARF_PLANET,
        verified: true,
    }, {
        sector: 7,
        type: ObjectType.DWARF_PLANET,
        verified: true,
    }, {
        sector: 8,
        type: ObjectType.GAS_CLOUD,
        verified: true,
    }]]));
    expect(scoreSelector(store.getState())).toEqual(expect.objectContaining({
        asteroids: 2,
        comets: 3,
        dwarfPlanets: 2,
        gasClouds: 4,
    }));
});
test("scoreSelector scores multiplayer theories correctly", () => {
    const store = createAppStore();
    store.dispatch(loadTestGameAction());
    store.dispatch(addTheoriesAction([[{
        sector: 1,
        type: ObjectType.ASTEROID,
        verified: true,
    }, {
        sector: 2,
        type: ObjectType.COMET,
        verified: true,
    }], [{
        sector: 3,
        type: ObjectType.GAS_CLOUD,
        verified: true,
    }]]));
    store.dispatch(addTheoriesAction([[{
        sector: 3,
        type: ObjectType.GAS_CLOUD,
        verified: true,
    }]]));
    expect(scoreSelector(store.getState())).toEqual(expect.objectContaining({
        asteroids: 2,
        comets: 3,
        gasClouds: 4,
        firstPlace: 2,
        subtotal: 11
    }));
});
test("scoreSelector properly identifies planet x location", () => {
    const store = createAppStore();
    store.dispatch(loadTestGameAction());
    expect(scoreSelector(store.getState())?.planetX).toEqual(false);
    store.dispatch(setAction({
        action: "Locate Planet X",
        result: "X",
        sectors: 5
    }));
    expect(scoreSelector(store.getState())?.planetX).toEqual(false);
    store.dispatch(setAction({
        action: "Locate Planet X",
        result: "\u2713",
        sectors: 5
    }));
    expect(scoreSelector(store.getState())?.planetX).toEqual(true);
});