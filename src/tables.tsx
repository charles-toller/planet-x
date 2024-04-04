import {Button, ButtonGroup, Card, Chip} from "@mui/material";
import {DataGrid, GridColDef, GridRowModel, useGridApiRef} from "@mui/x-data-grid";
import React, {useCallback} from "react";
import {useRecoilState} from "recoil";
import {Add, Remove} from "@mui/icons-material";
import {BottomRowModel, bottomRowsState, getNewActions, surveyReg, TopRowModel, topRowsState} from "./tableState";
import {
    adjustPlayerPosition,
    recoilPlayerPositionStateSelector
} from "./store/playerSectorPosition";
import {useDispatch, useSelector} from "react-redux";

const playerHeader = (playerNumber: number) => {
    return () => {
        const playerPositions = useSelector(recoilPlayerPositionStateSelector);
        const dispatch = useDispatch();
        const modifyPlayerPosition = useCallback((amount: number) => {
            dispatch(adjustPlayerPosition([playerNumber - 1, amount]));
        }, [dispatch, playerNumber]);
        const increasePlayerPositions = useCallback((e: React.MouseEvent) => {
            modifyPlayerPosition(1);
            e.stopPropagation();
        }, []);
        const decreasePlayerPositions = useCallback((e: React.MouseEvent) => {
            modifyPlayerPosition(-1);
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

const bottomColumnDefs: GridColDef[] = [
    {field: 'researchId', width: 50, headerName: ""},
    {field: 'researchType', width: 100, headerName: ""},
    {field: 'notes', flex: 1, headerName: "Research & Conference Notes"},
    {field: 'otherNotes', flex: 1, editable: true, headerName: "Other Notes"},
];

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

export function Tables() {
    const [topRows, setTopRows] = useRecoilState(topRowsState);
    const [bottomRows, setBottomRows] = useRecoilState(bottomRowsState);
    const dispatch = useDispatch();
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
        dispatch(adjustPlayerPosition([1, sectorCounts.p2 ?? 0]));
        dispatch(adjustPlayerPosition([2, sectorCounts.p3 ?? 0]));
        dispatch(adjustPlayerPosition([3, sectorCounts.p4 ?? 0]));
        return formattedRow;
    }, [apiRef]);
    const processBottomRowUpdate = useCallback((updatedRow: GridRowModel<BottomRowModel>) => {
        setBottomRows((bottomRows) => bottomRows.map((row) => row.id === updatedRow.id ? updatedRow : row));
        return updatedRow;
    }, []);
    return (
        <>
            <Card>
                <DataGrid disableColumnMenu={true} autoHeight columns={topColumnDefs} rows={topRows} apiRef={apiRef} processRowUpdate={processTopRowUpdate} onProcessRowUpdateError={(err) => console.error(err)} hideFooter={true} />
            </Card>
            <Card sx={{marginTop: "20px"}}>
                <DataGrid disableColumnMenu={true} autoHeight columns={bottomColumnDefs} rows={bottomRows} hideFooter={true} processRowUpdate={processBottomRowUpdate} />
            </Card>
        </>
    )
}