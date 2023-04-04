import React, {useCallback} from 'react';
import './App.css';
import NoteWheel from "./NoteWheel";
import {ObjectTypes, ObjId} from "./GameTypes";
import {Actions} from "./actions/Actions";
import {RecoilRoot, useRecoilState, useRecoilValueLoadable} from "recoil";
import {gameState, resetPersistentAtoms, sectorsState} from "./atoms";
import {SetGameId} from "./SetGameId";
import produce from "immer";
import {Tables} from "./tables";
function AppWrapper() {
    return (
        <RecoilRoot>
            <App />
        </RecoilRoot>
    )
}

function App() {
    const [sectors, setSectors] = useRecoilState(sectorsState);
    const game = useRecoilValueLoadable(gameState).valueMaybe();
    const reset = useCallback(() => {
        resetPersistentAtoms();
    }, [resetPersistentAtoms]);
    const onObjectClick = useCallback((obj: ObjId) => {
        const sectorIndex = parseInt(obj.slice(1)) - 1;
        const objType = obj.slice(0, 1) as ObjectTypes;
        setSectors(produce((draft) => {
            if (!draft[sectorIndex].x.includes(objType) && !draft[sectorIndex].o.includes(objType)) {
                draft[sectorIndex].x.push(objType);
            }
            else if (draft[sectorIndex].x.includes(objType)) {
                draft[sectorIndex].x = draft[sectorIndex].x.filter((a) => a !== objType);
                draft[sectorIndex].o.push(objType);
            }
            else {
                draft[sectorIndex].o = draft[sectorIndex].o.filter((a) => a !== objType);
            }
        }));
    }, [sectors, setSectors]);
    return (
        <div className="App">
            <div className="App-header">
                <NoteWheel leftSector={1} isAdvanced={true} sectors={sectors} onObjectClicked={onObjectClick}/>
                <div style={{width: "50%", padding: "20px"}}>
                    {game && <Actions resetGame={() => reset()} game={game} />}
                    {!game && <SetGameId />}
                    <Tables />
                </div>
            </div>
        </div>
    );
}

export default AppWrapper;
