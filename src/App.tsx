import React, {useCallback} from 'react';
import './App.css';
import NoteWheel from "./NoteWheel";
import {ObjectTypes, ObjId} from "./GameTypes";
import {Actions} from "./actions/Actions";
import {RecoilRoot} from "recoil";
import {SetGameId} from "./SetGameId";
import {Tables} from "./tables";
import {createTheme, ThemeProvider} from "@mui/material";
import {resetPersistentAtoms} from "./persistentAtomEffect";
import {Provider, useDispatch, useSelector} from "react-redux";
import {store} from "./store/store";
import {clickAction, mapSelector} from "./store/map";
import {ReduxGameState} from "./store/ReduxGameState";
function AppWrapper() {
    return (
        <Provider store={store}>
            <RecoilRoot>
                <App />
            </RecoilRoot>
        </Provider>
    )
}

const theme = createTheme({
    typography: {
        fontFamily: "Teko",
    }
})

function App() {
    const sectors = useSelector(mapSelector);
    const game = useSelector((state: ReduxGameState) => state.game.game);
    const reset = useCallback(() => {
        resetPersistentAtoms();
    }, [resetPersistentAtoms]);
    const dispatch = useDispatch();
    const onObjectClick = useCallback((obj: ObjId) => {
        const sector = parseInt(obj.slice(1));
        const objType = obj.slice(0, 1) as ObjectTypes;
        dispatch(clickAction({
            sector,
            object: objType
        }));
    }, [dispatch]);
    return (
        <div className="App">
            <ThemeProvider theme={theme}>
                <div className="App-header">
                    <NoteWheel leftSector={1} isAdvanced={true} sectors={sectors} onObjectClicked={onObjectClick}/>
                    <div style={{width: "50%", padding: "20px"}}>
                        {game && <Actions resetGame={() => reset()} game={game} sectors={sectors} />}
                        {!game && <SetGameId />}
                        <Tables />
                    </div>
                </div>
            </ThemeProvider>
        </div>
    );
}

export default AppWrapper;
