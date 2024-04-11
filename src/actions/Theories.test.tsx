import * as React from 'react';
import {expect, test} from 'vitest';
import {render} from '@testing-library/react';
import {Provider} from "react-redux";
import {createAppStore} from "../store/store";
import {Theories} from "./Theories";
import {addTheoriesAction} from "../store/theories";
import {ObjectType} from "../Game";
import {loadTestGameAction} from "../test/helpers";

test('theories render', async () => {
    const store = createAppStore();
    const {asFragment} = render(
        <Provider store={store}>
            <Theories game={store.getState().game.game!} sectors={store.getState().map} />
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
            <Theories game={store.getState().game.game!} sectors={store.getState().map} />
        </Provider>
    );
    expect(asFragment()).toMatchSnapshot();
});