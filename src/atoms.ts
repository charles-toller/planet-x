import {atom, DefaultValue} from "recoil";
import {inflate} from "pako";
import * as tar from "tar-stream";
import {Game, ObjectType} from "./Game";
import {WritableDraft} from "immer/dist/types/types-external";
import {store} from "./store/store";
import {
    recoilPlayerPositionStateSelector,
    updatePlayerPosition
} from "./store/playerSectorPosition";

const extract = tar.extract;

export function sectorClamp(sector: number, size = 18): number {
    let newSector = sector % size;
    while (newSector <= 0) newSector += size;
    return newSector;
}

export const playerPositionState = atom<[number, number, number]>({
    key: 'playerPosition',
    default: [1, 1, 1],
    effects: [
        ({setSelf, onSet}) => {
            setSelf(recoilPlayerPositionStateSelector(store.getState()));
            onSet((newValue, oldValue) => {
                newValue.forEach((playerPosition, i) => {
                    const playerID = i + 1;
                    if (oldValue instanceof DefaultValue || playerPosition !== oldValue[i]) {
                        store.dispatch(updatePlayerPosition([playerID, playerPosition]));
                    }
                });
            });
            return store.subscribe(() => {
                setSelf(recoilPlayerPositionStateSelector(store.getState()));
            });
        }
    ]
});

export function fetchGame(gameId: string): Promise<Game> {
    return new Promise((resolve) => {
        const e = extract();
        // @ts-ignore
        e.on('entry', (header, stream, next) => {
            if (header.name === `maps/${gameId}.json`) {
                let data = '';
                const decoder = new TextDecoder();
                // @ts-ignore
                stream.on('data', (d) => {
                    data += decoder.decode(d);
                });
                stream.on('end', () => {
                    const nGame = JSON.parse(data);
                    resolve(nGame);
                    next();
                });
            } else {
                stream.resume();
                stream.on('end', () => next());
            }
        });
        fetch(new URL('/maps.tar.gz', import.meta.url)).then((body) => body.arrayBuffer()).then((buffer) => {
            try {
                // @ts-ignore
                e.write(inflate(buffer));
            } catch (err) {
                // @ts-ignore
                e.write(new Uint8Array(buffer));
            }
        });
    });
}

export const gameState = atom<Game | null>({
    key: 'game',
    default: null,
    effects: [
        ({setSelf}) => {
            setSelf(store.getState().game.game);
            return store.subscribe(() => {
                setSelf(store.getState().game.game);
            });
        }
    ]
});

export interface TheoryObj {
    self: [sector: number, type: ObjectType, verified: boolean][];
    p2: [sector: number, type: ObjectType, verified: boolean][];
    p3: [sector: number, type: ObjectType, verified: boolean][];
    p4: [sector: number, type: ObjectType, verified: boolean][];
}

export const theoryKeys = ["self", "p2", "p3", "p4"] as const;

export function verifyAllTheories(draft: WritableDraft<TheoryObj[]>) {
    draft.forEach((row) => {
        for (const key of theoryKeys) {
            row[key].forEach((theory) => {
                theory[2] = true;
            });
        }
    });
}