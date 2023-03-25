import {Card} from "@mui/material";
import {DataGrid, GridColDef, GridRowModel, GridRowsProp, useGridApiRef} from "@mui/x-data-grid";
import React, {useCallback} from "react";
import {atom, noWait, selector, useRecoilState} from "recoil";
import {gameState, persistentAtomEffect, sectorClamp, sectorState} from "./atoms";
import {ConferenceKey} from "./Game";
import {researchName} from "./Research";

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

const topInitialRows: GridRowsProp<TopRowModel> = [
    {action: "", p2: "", p3: "", p4: "", id: 1, result: ""},
];

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

export const topRowsState = atom({
    key: 'topRows',
    effects: [
        persistentAtomEffect('topRows', topInitialRows),
    ],
});

const baseBottomRowsState = atom({
    key: 'baseBottomRows',
    effects: [
        persistentAtomEffect('baseBottomRows', bottomInitialRows),
    ],
});
/*
setBottomRows((bottomRows) => bottomRows.map((row) => ({
            ...row,
            researchType: researchName(game?.conf[row.researchId as ConferenceKey].title!, true)
        })))
* */
export const bottomRowsState = selector({
    key: 'bottomRows',
    get: ({get}) => {
        const game = get(noWait(gameState)).valueMaybe();
        return get(baseBottomRowsState).map((row) => ({
            ...row,
            researchType: researchName(game?.conf[row.researchId as ConferenceKey].title ?? [], true),
        }));
    },
    set: ({set}, newValue) => {
        set(baseBottomRowsState, newValue);
    }
})

const reg = /\s*([egdac])\s*(\d+)\s*-\s*(\d+)/;

function formatActionValue(input: string): string {
    const [_, type, start, end] = reg.exec(input) ?? [];
    if (!type || !start || !end) return input;
    return `${type.toUpperCase()} ${start}-${end}`;
}

export const tableActions = selector({
    key: 'tableActions',
    get: ({getCallback}) => {
        const setAction = getCallback(({set}) => async (action: string, result: string, sectors: number) => {
            set(sectorState, (currentSector) => sectorClamp(currentSector + sectors));
            set(topRowsState, (topRows) => {
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
        });
        const setResearch = getCallback(({set}) => async (researchKey: ConferenceKey, research: string) => {
            set(bottomRowsState, (bottomRows) => bottomRows.map((row) => row.researchId === researchKey ? {...row, notes: research} : row))
        });
        return {
            setAction,
            setResearch,
        };
    },
});

export function Tables() {
    const [topRows, setTopRows] = useRecoilState(topRowsState);
    const [bottomRows, setBottomRows] = useRecoilState(bottomRowsState);
    const apiRef = useGridApiRef();
    const processTopRowUpdate = useCallback((updatedRow: GridRowModel<TopRowModel>) => {
        const lastRowId = apiRef.current.getAllRowIds().map((a) => Number(a)).sort((a, b) => b - a)[0];
        const lastRow = apiRef.current.getRow(lastRowId);
        if ((updatedRow.id === lastRowId && Boolean(updatedRow.p2 || updatedRow.p3 || updatedRow.p4)) || Boolean(lastRow.p2 || lastRow.p3 || lastRow.p4)) {
            apiRef.current.updateRows([{id: lastRowId + 1}]);
        }
        const formattedRow = {
            ...updatedRow,
            p2: formatActionValue(updatedRow.p2 ?? ""),
            p3: formatActionValue(updatedRow.p3 ?? ""),
            p4: formatActionValue(updatedRow.p4 ?? "")
        };
        setTopRows((topRows) => topRows.map((row) => row.id === formattedRow.id ? formattedRow : row));
        return formattedRow;
    }, [apiRef]);
    const processBottomRowUpdate = useCallback((updatedRow: GridRowModel<BottomRowModel>) => {
        setBottomRows((bottomRows) => bottomRows.map((row) => row.id === updatedRow.id ? updatedRow : row));
        return updatedRow;
    }, []);
    return (
        <>
            <Card>
                <DataGrid autoHeight columns={topColumnDefs} rows={topRows} apiRef={apiRef} processRowUpdate={processTopRowUpdate} onProcessRowUpdateError={(err) => console.error(err)} hideFooter={true} />
            </Card>
            <Card sx={{marginTop: "20px"}}>
                <DataGrid autoHeight columns={bottomColumnDefs} rows={bottomRows} hideFooter={true} processRowUpdate={processBottomRowUpdate} />
            </Card>
        </>
    )
}