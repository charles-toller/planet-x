import {setReduxGameId} from "../store/setReduxGameId";
import {ObjectType} from "../Game";

export function loadTestGameAction() {
    return setReduxGameId.fulfilled({
        gameId: "aaaa",
        game: {
            obj: {
                1: ObjectType.ASTEROID,
                2: ObjectType.COMET,
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
    }, "aaaa", "test");
}