import * as React from 'react';
import {expect, test} from 'vitest';
import {render, screen} from '@testing-library/react';
import {Provider} from "react-redux";
import {createAppStore} from "../store/store";
import {Theories} from "./Theories";
import {addTheoriesAction} from "../store/theories";
import {ObjectType} from "../Game";
import {loadTestGameAction} from "../test/helpers";
import {setWorkingTheorySector} from "../store/workingTheories";
import userEvent from "@testing-library/user-event";
import {clickAction} from "../store/map";

test('theories render', async () => {
    const store = createAppStore();
    const {asFragment} = render(
        <Provider store={store}>
            <Theories />
        </Provider>
    );
    expect(asFragment()).toMatchSnapshot();
});
test('theories render with theory states', async () => {
    const store = createAppStore();
    store.dispatch(loadTestGameAction());
    store.dispatch(addTheoriesAction([[{
        type: ObjectType.ASTEROID,
        sector: 1,
        verified: true,
    }], [{
        type: ObjectType.PLAYER,
        sector: 1,
        verified: true,
    }], [{
        type: ObjectType.COMET,
        sector: 1,
        verified: true,
    }]]));
    const {asFragment} = render(
        <Provider store={store}>
            <Theories />
        </Provider>
    );
    expect(asFragment()).toMatchSnapshot();
});
test('theories render with selected theories', async () => {
    const store = createAppStore();
    store.dispatch(loadTestGameAction());
    store.dispatch(addTheoriesAction([[{
        type: ObjectType.COMET,
        sector: 1,
        verified: true,
    }]]));
    store.dispatch(addTheoriesAction([[{
        type: ObjectType.COMET,
        sector: 1,
        verified: true,
    }]]));
    store.dispatch(setWorkingTheorySector({
        playerId: 0,
        sector: 1,
        theoryIdx: 0
    }));
    const {asFragment} = render(
        <Provider store={store}>
            <Theories />
        </Provider>
    );
    expect(asFragment()).toMatchSnapshot();
});
test('can select and submit theory', async () => {
    userEvent.setup();
    const store = createAppStore();
    store.dispatch(loadTestGameAction());
    render(
        <Provider store={store}>
            <Theories />
        </Provider>
    );
    await userEvent.click(screen.getByRole("button", {name: /Player 1 Theory 1 Sector Select/}));
    await userEvent.click(screen.getByRole("option", {name: "1"}));
    await userEvent.click(screen.getByRole("button", {name: /Player 1 Theory 1 Object Select/}));
    await userEvent.click(screen.getByRole("option", {name: "Asteroid"}));
    await userEvent.click(screen.getByRole("button", {name: /submit theories/i}));
    expect(store.getState().theories[0][0][0]).toStrictEqual({
        sector: 1,
        type: ObjectType.ASTEROID,
        verified: false
    });
});
test('submits theory based on board', async () => {
    userEvent.setup();
    const store = createAppStore();
    store.dispatch(loadTestGameAction());
    store.dispatch(clickAction({sector: 1, object: "g"}));
    store.dispatch(clickAction({sector: 1, object: "g"}));
    render(
        <Provider store={store}>
            <Theories />
        </Provider>
    );
    await userEvent.click(screen.getByRole("button", {name: /Player 1 Theory 1 Sector Select/}));
    await userEvent.click(screen.getByRole("option", {name: "1"}));
    await userEvent.click(screen.getByRole("button", {name: /submit theories/i}));
    expect(store.getState().theories[0][0][0]).toStrictEqual({
        sector: 1,
        type: ObjectType.GAS_CLOUD,
        verified: false
    });
});
test('verifies theories', async () => {
    userEvent.setup();
    const store = createAppStore();
    store.dispatch(loadTestGameAction());
    render(
        <Provider store={store}>
            <Theories />
        </Provider>
    );
    await userEvent.click(screen.getByRole("button", {name: /Player 1 Theory 1 Sector Select/}));
    await userEvent.click(screen.getByRole("option", {name: "1"}));
    await userEvent.click(screen.getByRole("button", {name: /Player 1 Theory 1 Object Select/}));
    await userEvent.click(screen.getByRole("option", {name: "Asteroid"}));
    await userEvent.click(screen.getByRole("button", {name: /Player 2 Theory 1 Sector Select/}));
    await userEvent.click(screen.getByRole("option", {name: "2"}));
    await userEvent.click(screen.getByRole("button", {name: /submit theories/i}));
    await userEvent.click(screen.getByRole("button", {name: /verify all theories/i}));
    expect(store.getState().theories[0]).toStrictEqual([
        [{
            sector: 1,
            type: ObjectType.ASTEROID,
            verified: true
        }],
        [{
            sector: 2,
            type: ObjectType.PLAYER,
            verified: true,
        }],
        [],
        [],
    ]);
});
test('sets theory type with context menu', async () => {
    userEvent.setup();
    const store = createAppStore();
    store.dispatch(loadTestGameAction());
    render(
        <Provider store={store}>
            <Theories />
        </Provider>
    );
    await userEvent.click(screen.getByRole("button", {name: /Player 2 Theory 1 Sector Select/}));
    await userEvent.click(screen.getByRole("option", {name: "2"}));
    await userEvent.click(screen.getByRole("button", {name: /submit theories/i}));
    await userEvent.click(screen.getByRole("button", {name: /verify all theories/i}));
    expect(store.getState().theories[0][1]).toStrictEqual([
        {
            sector: 2,
            type: ObjectType.PLAYER,
            verified: true,
        },
    ]);
    await userEvent.pointer({keys: '[MouseRight>]', target: screen.getByRole("generic", {name: /theory by player 2: sector 2 is a player/i})});
    await userEvent.click(screen.getByRole("menuitem", {name: /set comets/i}));
    expect(store.getState().theories[0][1]).toStrictEqual([
        {
            sector: 2,
            type: ObjectType.COMET,
            verified: true,
        },
    ]);
    expect(store.getState().playerSectorPosition[0]).to.include(1);
    await userEvent.pointer({keys: '[MouseRight>]', target: screen.getByRole("generic", {name: /theory by player 2: sector 2 is a comet/i})});
    await userEvent.click(screen.getByRole("menuitem", {name: /set gas clouds/i}));
    expect(store.getState().theories[0][1]).toStrictEqual([
        {
            sector: 2,
            type: ObjectType.GAS_CLOUD,
            verified: true,
        },
    ]);
    expect(store.getState().playerSectorPosition[1]).to.include(1);
});