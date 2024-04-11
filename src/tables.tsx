import {Button, ButtonGroup, Card, Chip} from "@mui/material";
import {
    DataGrid,
    GridColDef,
    GridEventListener,
    useGridApiRef
} from "@mui/x-data-grid";
import React, {SyntheticEvent, useCallback} from "react";
import {Add, Remove} from "@mui/icons-material";
import {surveyReg} from "./tableState";
import {
    adjustPlayerPosition,
    recoilPlayerPositionStateSelector
} from "./store/playerSectorPosition";
import {useDispatch, useSelector} from "react-redux";
import {playerTextEnterAction, topRowsSelector} from "./store/topRows";
import {bottomRowsSelector, setNotesAction} from "./store/bottomRows";

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
    const topRows = useSelector(topRowsSelector);
    const bottomRows = useSelector(bottomRowsSelector);
    const dispatch = useDispatch();
    const topApiRef = useGridApiRef();
    const topCellEditStop = useCallback<GridEventListener<'cellEditStop'>>((params, event, details) => {
        const action = playerTextEnterAction({
            player: params.field as any,
            text: ((event as SyntheticEvent).target as HTMLInputElement).value,
            rowId: Number(params.id),
        });
        event.defaultMuiPrevented = true;
        topApiRef.current.stopCellEditMode({
            ignoreModifications: true,
            id: params.id,
            field: params.field,
            cellToFocusAfter: "none"
        });
        dispatch(action);
    }, [topApiRef, dispatch]);
    const bottomApiRef = useGridApiRef();
    const bottomCellEditStop = useCallback<GridEventListener<'cellEditStop'>>((params, event, details) => {
        const action = setNotesAction({
            rowId: Number(params.id),
            text: ((event as SyntheticEvent).target as HTMLInputElement).value,
        });
        event.defaultMuiPrevented = true;
        bottomApiRef.current.stopCellEditMode({
            ignoreModifications: true,
            id: params.id,
            field: params.field,
            cellToFocusAfter: "none"
        });
        dispatch(action);
    }, [dispatch]);
    return (
        <>
            <Card>
                <DataGrid disableColumnMenu={true} onCellEditStop={topCellEditStop} autoHeight columns={topColumnDefs} rows={topRows} apiRef={topApiRef} hideFooter={true} />
            </Card>
            <Card sx={{marginTop: "20px"}}>
                <DataGrid disableColumnMenu={true} autoHeight columns={bottomColumnDefs} rows={bottomRows} hideFooter={true} onCellEditStop={bottomCellEditStop} apiRef={bottomApiRef} />
            </Card>
        </>
    )
}