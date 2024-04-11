import * as React from 'react';
import {Button, Card, TextField} from "@mui/material";
import {useCallback, useState} from "react";
import {useDispatch} from "react-redux";
import {AppDispatch} from "./store/store";
import {setReduxGameId} from "./store/setReduxGameId";

export function SetGameId() {
    const [tempGameId, setTempGameId] = useState("");
    const dispatch = useDispatch<AppDispatch>();
    const cb = useCallback((e: React.FormEvent) => {
        dispatch(setReduxGameId(tempGameId.toUpperCase()));
        e.preventDefault()
    }, [tempGameId]);
    return (
        <Card sx={{marginBottom: "20px", padding: "20px"}}>
            <form onSubmit={cb}>
                <TextField variant="outlined"
                           label="Game ID"
                           value={tempGameId}
                           onChange={(e) => setTempGameId(e.target.value)}
                           InputProps={{endAdornment: <Button variant="outlined" onClick={cb}>Set</Button>}}/>
            </form>
        </Card>
    )
}