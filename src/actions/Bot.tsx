import * as React from "react";
import {useCallback} from "react";
import {Button} from "@mui/material";
import {useDispatch} from "react-redux";
import {tickBotAction} from "../store/bot";
export function Bot(props: {}) {
    const dispatch = useDispatch();
    const onButtonClick = useCallback(() => {
        dispatch(tickBotAction());
    }, []);
    return (
        <>
            <Button variant="outlined" onClick={onButtonClick}>Trigger Bot Action</Button>
        </>
    )
}