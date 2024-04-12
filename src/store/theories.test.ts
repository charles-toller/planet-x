import {createAppStore} from "./store";
import {expect, test} from 'vitest';
import {addTheoriesAction, legacyTheoriesSelector} from "./theories";
import {ObjectType} from "../Game";
import {loadTestGameAction} from "../test/helpers";

test("it initializes", () => {
    const store = createAppStore();
    expect(store.getState().theories).to.be.empty;
});

test("it accepts a new theory", () => {
    const store = createAppStore();
    store.dispatch(addTheoriesAction([[{
        type: ObjectType.COMET,
        sector: 1,
        verified: false,
    }]]));
    expect(legacyTheoriesSelector(store.getState())).toMatchSnapshot();
});

test("it verifies theories -- new", () => {
    const store = createAppStore();
    store.dispatch(loadTestGameAction());
    expect(legacyTheoriesSelector(store.getState())).toMatchSnapshot();
    store.dispatch(addTheoriesAction([[
        {
            sector: 1,
            type: ObjectType.ASTEROID,
            verified: false,
        }
    ]]));
    expect(legacyTheoriesSelector(store.getState())).toMatchSnapshot();
    store.dispatch(addTheoriesAction([[], [
        {
            sector: 1,
            type: ObjectType.COMET,
            verified: false,
        }
    ]]));
    expect(legacyTheoriesSelector(store.getState())).toMatchSnapshot();
    store.dispatch(addTheoriesAction([]));
    expect(legacyTheoriesSelector(store.getState())).toMatchSnapshot();
    // Player 1 should have moved forward a sector as a penalty
    expect(store.getState().playerSectorPosition[0]).to.include(0);
    expect(store.getState().playerSectorPosition[1]).to.include(1);
});