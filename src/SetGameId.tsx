import * as React from 'react';
import {Button, Card, TextField} from "@mui/material";
import {useRecoilState} from "recoil";
import {gameIdState} from "./atoms";
import {useCallback, useState} from "react";

export function SetGameId() {
    const [_, setGameId] = useRecoilState(gameIdState);
    const [tempGameId, setTempGameId] = useState("");
    const cb = useCallback((e: React.FormEvent) => {
        setGameId(tempGameId.toUpperCase());
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