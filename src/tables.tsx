import {Button, ButtonGroup, Card, Chip} from "@mui/material";
import {
    DataGrid,
    GridColDef,
    GridRowModel,
    GridRowsProp,
    useGridApiRef
} from "@mui/x-data-grid";
import React, {useCallback} from "react";
import {atom, noWait, selector, useRecoilState, useSetRecoilState} from "recoil";
import {gameState, persistentAtomEffect, playerPositionState, sectorClamp, sectorState} from "./atoms";
import {ConferenceKey} from "./Game";
import {researchName} from "./Research";
import {Add, Remove} from "@mui/icons-material";
import produce from "immer";

const playerHeader = (playerNumber: number) => {
    return () => {
        const [playerPositions, setPlayerPositions] = useRecoilState(playerPositionState);
        const increasePlayerPositions = useCallback((e: React.MouseEvent) => {
            setPlayerPositions(produce(draft => {
                draft[playerNumber - 2] = sectorClamp(draft[playerNumber - 2] + 1);
            }));
            e.stopPropagation();
        }, []);
        const decreasePlayerPositions = useCallback((e: React.MouseEvent) => {
            setPlayerPositions(produce(draft => {
                draft[playerNumber - 2] = sectorClamp(draft[playerNumber - 2] - 1);
            }));
            e.stopPropagation();
        }, []);
        return (
            <>
                {`Player ${playerNumber} `}
                <Chip label={playerPositions[playerNumber - 2]} sx={{margin: "0 1ex"}}/>
                <ButtonGroup variant="contained" size="small">
                    <Button onClick={increasePlayerPositions}><Add /></Button>
                    <Button onClick={decreasePlayerPositions}><Remove /></Button>
                </ButtonGroup>
            </>
        );
    }
}

const topColumnDefs: GridColDef[] = [
    {field: 'action', headerName: 'Action', flex: 1},
    {field: 'result', headerName: 'Result', flex: 0.5},
    {field: 'p2', headerName: 'Player 2', flex: 1, editable: true, renderHeader: playerHeader(2)},
    {field: 'p3', headerName: 'Player 3', flex: 1, editable: true, renderHeader: playerHeader(3)},
    {field: 'p4', headerName: 'Player 4', flex: 1, editable: true, renderHeader: playerHeader(4)},
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

const surveyReg = /^\s*([egdac])\s*(\d+)\s*-\s*(\d+)\s*$/i;
const researchReg = /^\s*r\s*([abcdef])\s*$/i;
const targetReg = /^\s*t\s*(\d+)\s*$/i;

function formatActionValue(input: string): string {
    const [, type, start, end] = surveyReg.exec(input) ?? [];
    if (type && start && end) {
        return `${type.toUpperCase()} ${start}-${end}`;
    }
    const [, researchType] = researchReg.exec(input) ?? [];
    if (researchType) {
        return `Research ${researchType.toUpperCase()}`;
    }
    const [, targetSector] = targetReg.exec(input) ?? [];
    if (targetSector) {
        return `Target ${targetSector}`;
    }
    return input;
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
type SectorMovement = {p2?: number; p3?: number; p4?: number};
function getNewActions(oldRow: GridRowModel<TopRowModel>, newRow: Pick<GridRowModel<TopRowModel>, 'p2' | 'p3' | 'p4'>): SectorMovement {
    const ret: SectorMovement = {};
    for (const key of (["p2", "p3", "p4"] as const)) {
        let regResult;
        if (oldRow[key] === "" && newRow[key] !== "") {
            if (newRow[key].startsWith("Research")) {
                ret[key] = 1;
            } else if (newRow[key].startsWith("Target")) {
                ret[key] = 4;
            } else if ((regResult = surveyReg.exec(newRow[key])) != null) {
                let numSectors = Number(regResult[3]) - Number(regResult[2]) + 1;
                while (numSectors < 1) numSectors += 18;
                if (numSectors > 6) {
                    ret[key] = 2;
                } else if (numSectors > 3) {
                    ret[key] = 3;
                } else {
                    ret[key] = 4;
                }
            }
        }
    }
    return ret;
}

export function Tables() {
    const [topRows, setTopRows] = useRecoilState(topRowsState);
    const [bottomRows, setBottomRows] = useRecoilState(bottomRowsState);
    const setPlayerPositions = useSetRecoilState(playerPositionState)
    const apiRef = useGridApiRef();
    const processTopRowUpdate = useCallback((updatedRow: GridRowModel<TopRowModel>, oldRow: GridRowModel<TopRowModel>) => {
        const lastRowId = apiRef.current.getAllRowIds().map((a) => Number(a)).sort((a, b) => b - a)[0];
        const lastRow = apiRef.current.getRow(lastRowId);
        let addRow = false;
        if ((updatedRow.id === lastRowId && Boolean(updatedRow.p2 || updatedRow.p3 || updatedRow.p4)) || Boolean(lastRow.p2 || lastRow.p3 || lastRow.p4)) {
            addRow = true;
        }
        const formattedRow = {
            ...updatedRow,
            p2: formatActionValue(updatedRow.p2 ?? ""),
            p3: formatActionValue(updatedRow.p3 ?? ""),
            p4: formatActionValue(updatedRow.p4 ?? "")
        };
        setTopRows((topRows) => {
            let formattedRows = topRows.map((row) => row.id === formattedRow.id ? formattedRow : row);
            if (addRow) {
                const newRowId = Math.max(...formattedRows.map((row) => row.id)) + 1;
                formattedRows.push({
                    id: newRowId,
                    action: "",
                    result: "",
                    p2: "",
                    p3: "",
                    p4: "",
                });
            }
            return formattedRows;
        });
        const sectorCounts = getNewActions(oldRow, formattedRow);
        setPlayerPositions((oldPlayerPositions) => [oldPlayerPositions[0] + (sectorCounts.p2 ?? 0), oldPlayerPositions[1] + (sectorCounts.p3 ?? 0), oldPlayerPositions[2] + (sectorCounts.p4 ?? 0)]);
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