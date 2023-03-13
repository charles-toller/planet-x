import React, {useCallback, useState} from 'react';
import './App.css';
import NoteWheel, {Sector} from "./NoteWheel";
import {ObjectTypes, ObjId} from "./GameTypes";
import {DataGrid, GridColDef, GridRowModel, GridRowsProp, useGridApiRef} from "@mui/x-data-grid";
import {Button, Card} from "@mui/material";

const baseSectors: Sector[] = new Array(18).fill(null).map((_, i) => ({
    x: [],
    o: []
}));

// baseSectors[1].x.push("x", "e", "g", "d", "a");
// baseSectors[1].o.push("c");

const reg = /\s*([egdac])\s*(\d+)\s*-\s*(\d+)/;

function formatValue(input: string): string {
    const [_, type, start, end] = reg.exec(input) ?? [];
    if (!type || !start || !end) return input;
    return `${type.toUpperCase()} ${start}-${end}`;
}

const topColumnDefs: GridColDef[] = [
    {field: 'action', headerName: 'Action', flex: 1, editable: true},
    {field: 'result', headerName: 'Result', flex: 0.5, editable: true},
    {field: 'p2', headerName: 'Player 2', flex: 1},
    {field: 'p3', headerName: 'Player 3', flex: 1},
    {field: 'p4', headerName: 'Player 4', flex: 1},
]

const topInitialRows: GridRowsProp = [
    {action: "", p2: "", p3: "", p4: "", id: 1, result: ""},
]

const bottomColumnDefs: GridColDef[] = [
    {field: 'researchId', width: 50, headerName: ""},
    {field: 'resarchType', width: 100, headerName: "", editable: true},
    {field: 'notes', flex: 1, editable: true, headerName: "Research & Conference Notes"},
    {field: 'otherNotes', flex: 1, editable: true, headerName: "Other Notes"},
];

const bottomInitialRows: GridRowsProp = [
    {id: 1, notes: "", otherNotes: "", researchId: "A"},
    {id: 2, notes: "", otherNotes: "", researchId: "B"},
    {id: 3, notes: "", otherNotes: "", researchId: "C"},
    {id: 4, notes: "", otherNotes: "", researchId: "D"},
    {id: 5, notes: "", otherNotes: "", researchId: "E"},
    {id: 6, notes: "", otherNotes: "", researchId: "F"},
    {id: 7, notes: "", otherNotes: "", researchId: "X1"},
    {id: 8, notes: "", otherNotes: "", researchId: "X2"},

];

function App() {
    const [sectors, setSectors] = useState(baseSectors);
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
    }, [sectors]);
    const apiRef = useGridApiRef();
    const processRowUpdate = useCallback((updatedRow: GridRowModel) => {
        const lastRowId = apiRef.current.getAllRowIds().map((a) => Number(a)).sort((a, b) => b - a)[0];
        console.log({
            lastRowId,
            updatedRow,
        });
        if ((updatedRow.id === lastRowId && Boolean(updatedRow.action)) || Boolean(apiRef.current.getRow(lastRowId).action)) {
            apiRef.current.updateRows([{id: lastRowId + 1}]);
        }
        return {...updatedRow, action: formatValue(updatedRow.action ?? "")};
    }, [apiRef]);
    return (
        <div className="App">
            <div className="App-header">
                <NoteWheel leftSector={1} isAdvanced={true} sectors={sectors} onObjectClicked={onObjectClick}/>
                <div style={{width: "50%", padding: "20px", height: "calc(100vh - 40px)"}}>
                    <Card>
                        <DataGrid autoHeight columns={topColumnDefs} rows={topInitialRows} apiRef={apiRef} processRowUpdate={processRowUpdate} onProcessRowUpdateError={(err) => console.error(err)} hideFooter={true} />
                    </Card>
                    <Card sx={{marginTop: "20px"}}>
                        <DataGrid autoHeight columns={bottomColumnDefs} rows={bottomInitialRows} hideFooter={true} />
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default App;
