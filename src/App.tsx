import React, {Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState} from 'react';
import './App.css';
import NoteWheel, {Sector} from "./NoteWheel";
import {ObjectTypes, ObjId} from "./GameTypes";
import {DataGrid, GridColDef, GridRowModel, GridRowsProp, useGridApiRef} from "@mui/x-data-grid";
import {Card} from "@mui/material";
import {Actions} from "./Actions";
import * as tar from 'tar-stream';
import {inflate} from "pako";
import {ConferenceKey, Game} from "./Game";
import {researchName} from "./Research";
const extract = tar.extract;
const baseSectors: Sector[] = new Array(18).fill(null).map((_, i) => ({
    x: [],
    o: []
}));

const reg = /\s*([egdac])\s*(\d+)\s*-\s*(\d+)/;

function formatValue(input: string): string {
    const [_, type, start, end] = reg.exec(input) ?? [];
    if (!type || !start || !end) return input;
    return `${type.toUpperCase()} ${start}-${end}`;
}

const topColumnDefs: GridColDef[] = [
    {field: 'action', headerName: 'Action', flex: 1},
    {field: 'result', headerName: 'Result', flex: 0.5},
    {field: 'p2', headerName: 'Player 2', flex: 1, editable: true},
    {field: 'p3', headerName: 'Player 3', flex: 1, editable: true},
    {field: 'p4', headerName: 'Player 4', flex: 1, editable: true},
]

interface TopRowModel {
    id: number;
    action: string;
    p2: string;
    p3: string;
    p4: string;
    result: string;
}

const topInitialRows: GridRowsProp<TopRowModel> = [
    {action: "", p2: "", p3: "", p4: "", id: 1, result: ""},
]

const bottomColumnDefs: GridColDef[] = [
    {field: 'researchId', width: 50, headerName: ""},
    {field: 'researchType', width: 100, headerName: ""},
    {field: 'notes', flex: 1, headerName: "Research & Conference Notes"},
    {field: 'otherNotes', flex: 1, editable: true, headerName: "Other Notes"},
];

interface BottomRowModel {
    id: number;
    notes: string;
    otherNotes: string;
    researchId: string;
    researchType: string;
}

const bottomInitialRows: GridRowsProp<BottomRowModel> = [
    {id: 1, notes: "", otherNotes: "", researchId: "A", researchType: ""},
    {id: 2, notes: "", otherNotes: "", researchId: "B", researchType: ""},
    {id: 3, notes: "", otherNotes: "", researchId: "C", researchType: ""},
    {id: 4, notes: "", otherNotes: "", researchId: "D", researchType: ""},
    {id: 5, notes: "", otherNotes: "", researchId: "E", researchType: ""},
    {id: 6, notes: "", otherNotes: "", researchId: "F", researchType: ""},
    {id: 7, notes: "", otherNotes: "", researchId: "X1", researchType: ""},
    {id: 8, notes: "", otherNotes: "", researchId: "X2", researchType: ""},
];

function usePersistentState<T>(localStorageKey: string, initialValue: T): [T, Dispatch<SetStateAction<T>>, () => void] {
    const localValue = localStorage.getItem(localStorageKey);
    let passInitialValue = initialValue;
    if (localValue !== null) {
        passInitialValue = JSON.parse(localValue);
    }
    const [state, setState] = useState(passInitialValue);
    const savedSetState = useCallback((action: SetStateAction<T>) => {
        setState((prevState) => {
            let value: T;
            if (typeof action === 'function') {
                value = (action as any)(prevState);
            } else {
                value = action;
            }
            localStorage.setItem(localStorageKey, JSON.stringify(value));
            return value;
        });
    }, [setState, localStorageKey]);
    const resetState = useCallback(() => {
        savedSetState(initialValue);
    }, [savedSetState, initialValue]);
    return [state, savedSetState, resetState];
}

function useFetchGame(gameId: string | null): Game | null {
    const [game, setGame] = useState<Game | null>(null);
    useEffect(() => {
        if (gameId == null) {
            setGame(null);
            return;
        }
        const e = extract();
        e.on('entry', (header, stream, next) => {
            if (header.name === `maps/${gameId}.json`) {
                let data = '';
                const decoder = new TextDecoder();
                stream.on('data', (d) => {
                    data += decoder.decode(d);
                });
                stream.on('end', () => {
                    const nGame = JSON.parse(data);
                    setGame(nGame);
                    // @ts-ignore
                    window.game = nGame;
                    next();
                });
            }
            else {
                stream.resume();
                stream.on('end', () => next());
            }
        });
        fetch(new URL('/maps.tar.gz', import.meta.url)).then((body) => body.arrayBuffer()).then((buffer) => {
            try {
                e.write(inflate(buffer));
            } catch (err) {
                e.write(new Uint8Array(buffer));
            }
        });
    }, [gameId]);
    return game;
}

function App() {
    const [sectors, setSectors, resetSectors] = usePersistentState('sectors', baseSectors);
    const [gameId, setGameId, resetGameId] = usePersistentState<string | null>('gameId', 'M4A2');
    const game = useFetchGame(gameId);
    const [topRows, setTopRows, resetTopRows] = usePersistentState('topRows', topInitialRows);
    const [bottomRows, setBottomRows, resetBottomRows] = usePersistentState('bottomRows', bottomInitialRows);
    useEffect(() => {
        if (game == null) return;
        setBottomRows((bottomRows) => bottomRows.map((row) => ({
            ...row,
            researchType: researchName(game?.conf[row.researchId as ConferenceKey].title!, true)
        })))
    }, [game]);
    const reset = useCallback(() => {
        resetSectors();
        resetGameId();
        resetTopRows();
        resetBottomRows();
    }, [resetSectors, resetGameId, resetTopRows, resetBottomRows]);
    const onObjectClick = useCallback((obj: ObjId) => {
        const sectorIndex = parseInt(obj.slice(1)) - 1;
        const objType = obj.slice(0, 1) as ObjectTypes;
        if (!sectors[sectorIndex].x.includes(objType) && !sectors[sectorIndex].o.includes(objType)) {
            const newSectors = [...sectors];
            newSectors[sectorIndex].x = [...newSectors[sectorIndex].x];
            newSectors[sectorIndex].x.push(objType);
            setSectors(newSectors);
        }
        else if (sectors[sectorIndex].x.includes(objType)) {
            const newSectors = [...sectors];
            newSectors[sectorIndex].x = [...newSectors[sectorIndex].x].filter((a) => a !== objType);
            newSectors[sectorIndex].o = [...newSectors[sectorIndex].o];
            newSectors[sectorIndex].o.push(objType);
            setSectors(newSectors);
        }
        else {
            const newSectors = [...sectors];
            newSectors[sectorIndex].o = [...newSectors[sectorIndex].o].filter((a) => a !== objType);
            setSectors(newSectors);
        }
    }, [sectors, setSectors]);
    const apiRef = useGridApiRef();
    const processTopRowUpdate = useCallback((updatedRow: GridRowModel<TopRowModel>) => {
        const lastRowId = apiRef.current.getAllRowIds().map((a) => Number(a)).sort((a, b) => b - a)[0];
        const lastRow = apiRef.current.getRow(lastRowId);
        if ((updatedRow.id === lastRowId && Boolean(updatedRow.p2 || updatedRow.p3 || updatedRow.p4)) || Boolean(lastRow.p2 || lastRow.p3 || lastRow.p4)) {
            apiRef.current.updateRows([{id: lastRowId + 1}]);
        }
        const formattedRow = {
            ...updatedRow,
            p2: formatValue(updatedRow.p2 ?? ""),
            p3: formatValue(updatedRow.p3 ?? ""),
            p4: formatValue(updatedRow.p4 ?? "")
        };
        setTopRows((topRows) => topRows.map((row) => row.id === formattedRow.id ? formattedRow : row));
        return formattedRow;
    }, [apiRef]);
    const setResearch = useCallback((researchKey: ConferenceKey, research: string) => {
        setBottomRows((bottomRows) => bottomRows.map((row) => row.researchId === researchKey ? {...row, notes: research} : row));
    }, []);
    const setAction = useCallback((action: string, result: string) => {
        setTopRows((topRows) => {
            const newTopRows = [...topRows];
            let index = newTopRows.findIndex((row) => row.action === "");
            if (index === -1) {
                newTopRows.push({
                    id: newTopRows[newTopRows.length - 1].id + 1,
                    action: "",
                    result: "",
                    p2: "",
                    p3: "",
                    p4: "",
                });
                index = newTopRows.length - 1;
            }
            newTopRows[index] = {
                ...newTopRows[index],
                action,
                result,
            };
            return newTopRows;
        });
    }, []);
    return (
        <div className="App">
            <div className="App-header">
                <NoteWheel leftSector={1} isAdvanced={true} sectors={sectors} onObjectClicked={onObjectClick}/>
                <div style={{width: "50%", padding: "20px", height: "calc(100vh - 40px)"}}>
                    {game && <Actions resetGame={() => reset()} game={game} setResearch={setResearch} setAction={setAction}/>}
                    <Card>
                        <DataGrid autoHeight columns={topColumnDefs} rows={topRows} apiRef={apiRef} processRowUpdate={processTopRowUpdate} onProcessRowUpdateError={(err) => console.error(err)} hideFooter={true} />
                    </Card>
                    <Card sx={{marginTop: "20px"}}>
                        <DataGrid autoHeight columns={bottomColumnDefs} rows={bottomRows} hideFooter={true} />
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default App;
