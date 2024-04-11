import {createAppStore} from "./store";
import {expect, test} from 'vitest';
import {addTheoriesAction, theoriesSelector} from "./theories";
import {ObjectType} from "../Game";
import {setReduxGameId} from "./setReduxGameId";

test("it initializes", () => {
    const store = createAppStore();
    expect(store.getState().theories).to.be.empty;
});

test("it accepts a new theory", () => {
    const store = createAppStore();
    store.dispatch(addTheoriesAction({
        self: [[1, ObjectType.COMET, false]],
        p2: [],
        p3: [],
        p4: [],
    }));
    expect(theoriesSelector(store.getState())).toMatchSnapshot();
});

test("it verifies theories", () => {
    const store = createAppStore();
    store.dispatch(setReduxGameId.fulfilled({
        gameId: "aaaa",
        game: {
            obj: {
                1: ObjectType.ASTEROID
            },
            conf: {
                A: {body: {type: "confClue1PlusXAdjacentY", X: ObjectType.COMET, Y: ObjectType.COMET, N: 1}, title: [ObjectType.COMET]},
                B: {body: {type: "confClue1PlusXAdjacentY", X: ObjectType.COMET, Y: ObjectType.COMET, N: 1}, title: [ObjectType.COMET]},
                C: {body: {type: "confClue1PlusXAdjacentY", X: ObjectType.COMET, Y: ObjectType.COMET, N: 1}, title: [ObjectType.COMET]},
                D: {body: {type: "confClue1PlusXAdjacentY", X: ObjectType.COMET, Y: ObjectType.COMET, N: 1}, title: [ObjectType.COMET]},
                E: {body: {type: "confClue1PlusXAdjacentY", X: ObjectType.COMET, Y: ObjectType.COMET, N: 1}, title: [ObjectType.COMET]},
                F: {body: {type: "confClue1PlusXAdjacentY", X: ObjectType.COMET, Y: ObjectType.COMET, N: 1}, title: [ObjectType.COMET]},
                X1: {body: {type: "confClue1PlusXAdjacentY", X: ObjectType.COMET, Y: ObjectType.COMET, N: 1}, title: [ObjectType.COMET]},
                X2: {body: {type: "confClue1PlusXAdjacentY", X: ObjectType.COMET, Y: ObjectType.COMET, N: 1}, title: [ObjectType.COMET]},
            }
        }
    }, "aaaa", "test"));
    expect(theoriesSelector(store.getState())).toMatchSnapshot();
    store.dispatch(addTheoriesAction({
        self: [[1, ObjectType.ASTEROID, false]],
        p2: [],
        p3: [],
        p4: [],
    }));
    expect(theoriesSelector(store.getState())).toMatchSnapshot();
    store.dispatch(addTheoriesAction({
        self: [],
        p2: [[1, ObjectType.COMET, false]],
        p3: [],
        p4: [],
    }));
    expect(theoriesSelector(store.getState())).toMatchSnapshot();
    store.dispatch(addTheoriesAction({
        self: [],
        p2: [],
        p3: [],
        p4: [],
    }));
    expect(theoriesSelector(store.getState())).toMatchSnapshot();
    // Player 1 should have moved forward a sector as a penalty
    expect(store.getState().playerSectorPosition[0]).to.include(0);
    expect(store.getState().playerSectorPosition[1]).to.include(1);
})